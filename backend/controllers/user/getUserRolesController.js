const userService = require('../../services/userServices');

const getUserRoles = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await userService.getUserRoles(id);
        return res.status(200).json(result);
    } catch (error) {
        return res.status(404).json(error);
    }
};

module.exports = getUserRoles;
