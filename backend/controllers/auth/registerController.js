const jwt = require('jsonwebtoken');
const userService = require('../../services/userService');
const authConfig = require('../../config/authConfig');

const register = async (req, res) => {
    try {
        const userData = req.body;

        if (!userData) {
            return res.status(400).json({
                success: false,
                message: 'Request body cannot be empty'
            });
        }

        const result = await userService.createUser(userData);

        // Generar JWT para el usuario recién creado
        const user = result.data;
        const primaryRole = user.role || authConfig.defaultRole;

        const token = jwt.sign(
            { id: user.id, role: primaryRole },
            authConfig.jwtSecret,
            { expiresIn: authConfig.jwtExpiresIn }
        );

        return res.status(201).json({
            ...result,
            data: {
                ...user,
                token
            }
        });
    } catch (error) {
        const statusCode = error.error?.includes('Email already') ? 409 : 400;
        return res.status(statusCode).json(error);
    }
};

module.exports = register;
