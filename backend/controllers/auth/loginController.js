const jwt = require('jsonwebtoken');
const userModel = require('../../models/userModel');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const authConfig = require('../../config/authConfig');

const FRONTEND_TO_BACKEND_ROLE = {
    administrator: 'super_admin',
    super_admin: 'super_admin',
    superadmin: 'super_admin',
    vendor: 'admin',
    admin: 'admin',
    seller: 'admin',
    customer: 'cliente',
    cliente: 'cliente',
    client: 'cliente',
    buyer: 'cliente'
};

const ROLE_ID_TO_BACKEND = {
    1: 'super_admin',
    2: 'admin',
    3: 'cliente'
};

const PUBLIC_LOGIN_ROLES = ['cliente', 'admin'];

const normalizeBackendRole = (value) => {
    if (value === undefined || value === null || value === '') {
        return null;
    }

    if (typeof value === 'number' || /^\d+$/.test(String(value))) {
        return ROLE_ID_TO_BACKEND[parseInt(value, 10)] || null;
    }

    const normalized = String(value).trim().toLowerCase().replace(/\s+/g, '_');
    return FRONTEND_TO_BACKEND_ROLE[normalized] || normalized;
};

const userHasRole = (roles, backendRole) =>
    roles.some((entry) => entry.name === backendRole);

const pickRoleForToken = (roles, backendRole) => {
    if (backendRole && userHasRole(roles, backendRole)) {
        return backendRole;
    }
    return roles[0]?.name || authConfig.defaultRole;
};

const validateCredentials = async (email, password) => {
    if (!email || !password) {
        return {
            error: {
                status: 400,
                message: 'Email and password are required',
            },
        };
    }

    const user = await userModel.getUserByEmail(email);

    if (!user) {
        return {
            error: {
                status: 404,
                message: 'User not found',
            },
        };
    }

    let passwordMatches = await bcrypt.compare(password, user.password_hash);
    let migratedLegacyHash = false;

    if (!passwordMatches) {
        const legacyHash = crypto.createHash('sha256').update(password).digest('hex');
        if (legacyHash === user.password_hash) {
            passwordMatches = true;
            migratedLegacyHash = true;
        }
    }

    if (!passwordMatches) {
        return {
            error: {
                status: 401,
                message: 'Invalid credentials',
            },
        };
    }

    if (user.status !== 'active') {
        const statusMessage =
            user.status === 'deleted'
                ? 'Cuenta eliminada. Usa el formulario de reactivación para recuperar tu cuenta con el mismo correo.'
                : 'Cuenta desactivada. No es posible iniciar sesión.';
        return {
            error: {
                status: 403,
                message: statusMessage,
            },
        };
    }

    if (migratedLegacyHash) {
        const newHash = await bcrypt.hash(password, 10);
        await userModel.updatePasswordHash(user.id, newHash);
    }

    const roles = await userModel.getUserRoles(user.id);

    return { user, roles };
};

const buildLoginResponse = (user, roles, primaryRole) => {
    const token = jwt.sign(
        { id: user.id, role: primaryRole },
        authConfig.jwtSecret,
        { expiresIn: authConfig.jwtExpiresIn }
    );

    delete user.password_hash;

    return {
        success: true,
        data: {
            token,
            user: {
                ...user,
                role: primaryRole,
                roles,
            },
            role: primaryRole,
        },
        message: 'Login successful',
    };
};

const resolveExpectedRoleFromBody = (body) =>
    normalizeBackendRole(body.expectedRole) ||
    normalizeBackendRole(body.role) ||
    normalizeBackendRole(body.role_id);

const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const credentialResult = await validateCredentials(email, password);

        if (credentialResult.error) {
            return res.status(credentialResult.error.status).json({
                success: false,
                message: credentialResult.error.message,
            });
        }

        const { user, roles } = credentialResult;
        const expectedRole = resolveExpectedRoleFromBody(req.body);

        if (!expectedRole || !PUBLIC_LOGIN_ROLES.includes(expectedRole)) {
            return res.status(400).json({
                success: false,
                message: 'Debes indicar un rol válido para iniciar sesión: cliente o vendedor.',
            });
        }

        if (userHasRole(roles, 'super_admin')) {
            return res.status(403).json({
                success: false,
                message: 'Esta cuenta debe iniciar sesión desde el acceso de administrador del sistema.',
            });
        }

        if (!userHasRole(roles, expectedRole)) {
            const roleLabels = {
                cliente: 'cliente',
                admin: 'vendedor'
            };
            return res.status(403).json({
                success: false,
                message: `No tienes permisos para iniciar sesión como ${roleLabels[expectedRole] || expectedRole}.`,
            });
        }

        const primaryRole = pickRoleForToken(roles, expectedRole);

        return res.status(200).json(buildLoginResponse(user, roles, primaryRole));
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Login error',
            error: error.message,
        });
    }
};

const loginAdmin = async (req, res) => {
    try {
        const { email, password } = req.body;
        const credentialResult = await validateCredentials(email, password);

        if (credentialResult.error) {
            return res.status(credentialResult.error.status).json({
                success: false,
                message: credentialResult.error.message,
            });
        }

        const { user, roles } = credentialResult;

        if (!userHasRole(roles, 'super_admin')) {
            return res.status(403).json({
                success: false,
                message: 'No tienes permisos para acceder como super administrador.',
            });
        }

        const primaryRole = pickRoleForToken(roles, 'super_admin');

        return res.status(200).json(buildLoginResponse(user, roles, primaryRole));
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Login error',
            error: error.message,
        });
    }
};

module.exports = login;
module.exports.loginAdmin = loginAdmin;
