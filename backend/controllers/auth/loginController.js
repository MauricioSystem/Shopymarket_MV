const jwt = require('jsonwebtoken');
const userModel = require('../../models/userModel');
const crypto = require('crypto');
const authConfig = require('../../config/authConfig');

const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Email and password are required'
            });
        }

        const user = await userModel.getUserByEmail(email);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        const passwordHash = crypto.createHash('sha256').update(password).digest('hex');

        if (passwordHash !== user.password_hash) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }

        // Obtener los roles reales del usuario desde la BD
        const roles = await userModel.getUserRoles(user.id);
        const primaryRole = roles[0]?.name || authConfig.defaultRole;

        // Bug #3 fix: generar JWT real firmado
        const token = jwt.sign(
            { id: user.id, role: primaryRole },
            authConfig.jwtSecret,
            { expiresIn: authConfig.jwtExpiresIn }
        );

        delete user.password_hash;

        return res.status(200).json({
            success: true,
            data: {
                token,
                user: {
                    ...user,
                    role: primaryRole,
                    roles
                },
                role: primaryRole
            },
            message: 'Login successful'
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Login error',
            error: error.message
        });
    }
};

module.exports = login;
