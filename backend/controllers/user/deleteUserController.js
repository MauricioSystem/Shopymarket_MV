const userService = require('../../services/userServices');

const deleteUser = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await userService.deleteUser(id);
        return res.status(200).json(result);
    } catch (error) {
        const statusCode = error.error?.includes('User not found') ? 404 : 400;
        return res.status(statusCode).json(error);
    }
};

module.exports = deleteUser;
