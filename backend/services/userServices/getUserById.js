const userModel = require('../../models/userModel');
const { validateUserId } = require('../validators');

const getUserById = async (userId) => {
    try {
        validateUserId(userId);

        const user = await userModel.getUserById(userId);
        if (!user) {
            throw new Error('User not found');
        }

        return {
            success: true,
            data: user,
            message: 'User obtained successfully'
        };
    } catch (error) {
        throw {
            success: false,
            message: 'Error getting user',
            error: error.message
        };
    }
};

module.exports = getUserById;
