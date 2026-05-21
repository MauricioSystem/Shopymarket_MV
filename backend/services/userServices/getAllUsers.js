const userModel = require('../../models/userModel');

const getAllUsers = async () => {
    try {
        const users = await userModel.getAllUsersWithRoles();
        return {
            success: true,
            data: users,
            message: 'Users obtained successfully'
        };
    } catch (error) {
        throw {
            success: false,
            message: 'Error getting users',
            error: error.message
        };
    }
};

module.exports = getAllUsers;
