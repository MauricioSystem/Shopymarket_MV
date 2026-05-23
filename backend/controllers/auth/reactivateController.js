const jwt = require('jsonwebtoken');
const authConfig = require('../../config/authConfig');
const userService = require('../../services/userServices');

const reactivate = async (req, res) => {
    try {
        const credentials = req.body;
        const result = await userService.reactivateUser(credentials);

        const user = result.data;
        const roles = user.roles || [];
        const primaryRole = roles[0]?.name || authConfig.defaultRole;

        const token = jwt.sign(
            { id: user.id, role: primaryRole },
            authConfig.jwtSecret,
            { expiresIn: authConfig.jwtExpiresIn }
        );

        return res.status(200).json({
            success: true,
            data: {
                ...user,
                role: primaryRole,
                token
            },
            message: result.message
        });
    } catch (error) {
        const statusCode = error.error?.includes('not found') ? 404 : 400;
        return res.status(statusCode).json(error);
    }
};

module.exports = reactivate;
