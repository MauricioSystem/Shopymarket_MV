const userModel = require('../../models/userModel');
const { validateUserId } = require('../../validators');

const getUserRoles = async (userId) => {
    try {
        validateUserId(userId);

        const roles = await userModel.getUserRoles(userId);

        return {
            success: true,
            data: roles,
            message: 'Roles obtained successfully'
        };
    } catch (error) {
        throw {
            success: false,
            message: 'Error getting roles',
            error: error.message
        };
    }
};

module.exports = getUserRoles;
