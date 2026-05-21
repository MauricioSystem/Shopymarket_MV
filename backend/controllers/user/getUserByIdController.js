const userService = require('../../services/userServices');

const getUserById = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await userService.getUserById(id);
        return res.status(200).json(result);
    } catch (error) {
        return res.status(404).json(error);
    }
};

module.exports = getUserById;
