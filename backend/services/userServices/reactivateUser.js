const userModel = require('../../models/userModel');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const { validateEmail, validatePassword } = require('../validators');
const emailService = require('../emailService/emailService');

const hashValue = (value) => crypto.createHash('sha256').update(String(value)).digest('hex');

const createCode = () => String(Math.floor(10000 + Math.random() * 90000));

const getDeletedUserByEmail = async (emailValue) => {
    validateEmail(emailValue);
    const email = emailValue.toLowerCase().trim();
    const user = await userModel.getUserByEmail(email);

    if (!user) {
        throw new Error('User not found');
    }

    if (user.status === 'active') {
        throw new Error('La cuenta ya está activa. Inicia sesión normalmente.');
    }

    if (user.status !== 'deleted') {
        throw new Error('La cuenta no está eliminada y no puede recuperarse por este flujo.');
    }

    return user;
};

const requestReactivationCode = async ({ email }) => {
    try {
        if (!email) {
            throw new Error('El correo es obligatorio');
        }

        const user = await getDeletedUserByEmail(email);
        const code = createCode();
        const codeHash = await bcrypt.hash(code, 10);
        const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

        await userModel.createReactivationCode({
            userId: user.id,
            email: user.email,
            codeHash,
            expiresAt,
        });

        await emailService.sendReactivationCodeEmail(user, code);

        return {
            success: true,
            data: { email: user.email, expires_in_minutes: 5 },
            message: 'Código enviado al correo'
        };
    } catch (error) {
        throw {
            success: false,
            message: 'Error al solicitar recuperación',
            error: error?.error || error?.message || 'No se pudo enviar el código'
        };
    }
};

const verifyReactivationCode = async ({ email, code }) => {
    try {
        if (!email || !code) {
            throw new Error('El correo y el código son obligatorios');
        }

        const user = await getDeletedUserByEmail(email);
        const normalizedEmail = user.email.toLowerCase().trim();
        const recovery = await userModel.getLatestReactivationCodeByEmail(normalizedEmail);

        if (!recovery || String(recovery.user_id) !== String(user.id)) {
            throw new Error('Código inválido o vencido');
        }

        if (new Date(recovery.expires_at).getTime() < Date.now()) {
            await userModel.consumeReactivationCode(recovery.id);
            throw new Error('El código venció. Solicita uno nuevo.');
        }

        const matches = await bcrypt.compare(String(code), recovery.code_hash);
        if (!matches) {
            throw new Error('Código inválido');
        }

        const resetToken = crypto.randomBytes(32).toString('hex');
        await userModel.markReactivationCodeVerified(recovery.id, hashValue(resetToken));

        return {
            success: true,
            data: { email: normalizedEmail, reset_token: resetToken },
            message: 'Código verificado'
        };
    } catch (error) {
        throw {
            success: false,
            message: 'Error al verificar código',
            error: error.message
        };
    }
};

const resetPasswordAndReactivate = async ({ email, reset_token, password }) => {
    try {
        if (!email || !reset_token || !password) {
            throw new Error('El correo, token y contraseña son obligatorios');
        }

        validatePassword(password);

        const user = await getDeletedUserByEmail(email);
        const normalizedEmail = user.email.toLowerCase().trim();
        const recovery = await userModel.getLatestReactivationCodeByEmail(normalizedEmail);

        if (!recovery || String(recovery.user_id) !== String(user.id) || !recovery.verified_at || !recovery.reset_token_hash) {
            throw new Error('La recuperación no fue verificada');
        }

        if (new Date(recovery.expires_at).getTime() < Date.now()) {
            await userModel.consumeReactivationCode(recovery.id);
            throw new Error('La recuperación venció. Solicita un nuevo código.');
        }

        if (hashValue(reset_token) !== recovery.reset_token_hash) {
            throw new Error('Token de recuperación inválido');
        }

        const newHash = await bcrypt.hash(password, 10);
        await userModel.updatePasswordHash(user.id, newHash);

        const restoredUser = await userModel.reactivateUser(user.id);
        const roles = await userModel.getUserRoles(user.id);
        const primaryRole = roles[0]?.name || null;

        await userModel.consumeReactivationCode(recovery.id);
        emailService.addContactToBrevo(restoredUser);
        emailService.sendAccountReactivatedEmail(restoredUser);

        return {
            success: true,
            data: {
                ...restoredUser,
                role: primaryRole,
                roles
            },
            message: 'Cuenta reactivada correctamente'
        };
    } catch (error) {
        throw {
            success: false,
            message: 'Error al cambiar contraseña y reactivar la cuenta',
            error: error.message
        };
    }
};

module.exports = {
    requestReactivationCode,
    verifyReactivationCode,
    resetPasswordAndReactivate,
};
