const userModel = require('../../models/userModel');
const { validateUserId } = require('../../validators');

const deleteUser = async (userId) => {
    try {
        validateUserId(userId);

        const user = await userModel.getUserById(userId);
        if (!user) {
            throw new Error('User not found');
        }

        const deletedUser = await userModel.deleteUser(userId);

        return {
            success: true,
            data: deletedUser,
            message: 'User deleted successfully'
        };
    } catch (error) {
        throw {
            success: false,
            message: 'Error deleting user',
            error: error.message
        };
    }
};

module.exports = deleteUser;
