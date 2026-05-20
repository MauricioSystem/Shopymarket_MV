const userService = require('../../services/userService');

const getAllUsers = async (req, res) => {
    try {
        const result = await userService.getAllUsers();
        return res.status(200).json(result);
    } catch (error) {
        return res.status(500).json(error);
    }
};

module.exports = getAllUsers;
