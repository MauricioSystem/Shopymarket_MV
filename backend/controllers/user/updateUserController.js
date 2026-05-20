const userService = require('../../services/userService');

const updateUser = async (req, res) => {
    try {
        const { id } = req.params;
        const userData = req.body;

        if (!userData || Object.keys(userData).length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Request body cannot be empty'
            });
        }

        const result = await userService.updateUser(id, userData);
        return res.status(200).json(result);
    } catch (error) {
        const statusCode = error.error?.includes('User not found') ? 404 : 400;
        return res.status(statusCode).json(error);
    }
};

module.exports = updateUser;
