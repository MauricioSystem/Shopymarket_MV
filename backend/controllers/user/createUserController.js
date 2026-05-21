const userService = require('../../services/userServices');

const createUser = async (req, res) => {
    try {
        const userData = req.body;

        if (!userData) {
            return res.status(400).json({
                success: false,
                message: 'Request body cannot be empty'
            });
        }

        const result = await userService.createUser(userData);
        return res.status(201).json(result);
    } catch (error) {
        const statusCode = error.error?.includes('email already') ? 409 : 400;
        return res.status(statusCode).json(error);
    }
};

module.exports = createUser;
