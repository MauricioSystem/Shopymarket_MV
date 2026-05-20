const userModel = require('../models/userModel');
const crypto = require('crypto');

const getAllUsers = async () => {
    try {
        const users = await userModel.getAllUsers();
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

const getUserById = async (userId) => {
    try {
        if (!userId || isNaN(userId)) {
            throw new Error('Invalid user ID');
        }

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

const createUser = async (userData) => {
    try {
        if (!userData.first_name || !userData.email || !userData.password) {
            throw new Error('first_name, email and password are required');
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(userData.email)) {
            throw new Error('Invalid email format');
        }

        const existingUser = await userModel.getUserByEmail(userData.email);
        if (existingUser) {
            throw new Error('Email already registered');
        }

        if (userData.password.length < 6) {
            throw new Error('Password must be at least 6 characters');
        }

        const password_hash = crypto
            .createHash('sha256')
            .update(userData.password)
            .digest('hex');

        const newUserData = {
            first_name: userData.first_name.trim(),
            last_name: userData.last_name?.trim() || null,
            email: userData.email.toLowerCase().trim(),
            password_hash,
            phone: userData.phone?.trim() || null,
            country: userData.country?.trim() || null,
            city: userData.city?.trim() || null,
            address: userData.address?.trim() || null
        };

        const user = await userModel.createUser(newUserData);

        delete user.password_hash;

        return {
            success: true,
            data: user,
            message: 'User created successfully'
        };
    } catch (error) {
        throw {
            success: false,
            message: 'Error creating user',
            error: error.message
        };
    }
};

const updateUser = async (userId, userData) => {
    try {
        if (!userId || isNaN(userId)) {
            throw new Error('Invalid user ID');
        }

        const user = await userModel.getUserById(userId);
        if (!user) {
            throw new Error('User not found');
        }

        if (userData.email) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(userData.email)) {
                throw new Error('Invalid email format');
            }

            const existingUser = await userModel.getUserByEmail(userData.email);
            if (existingUser && existingUser.id !== parseInt(userId)) {
                throw new Error('Email already in use');
            }
        }

        const updateData = {
            first_name: userData.first_name?.trim() || user.first_name,
            last_name: userData.last_name?.trim() || user.last_name,
            phone: userData.phone?.trim() || user.phone,
            profile_image_url: userData.profile_image_url || user.profile_image_url,
            country: userData.country?.trim() || user.country,
            city: userData.city?.trim() || user.city,
            address: userData.address?.trim() || user.address
        };

        const updatedUser = await userModel.updateUser(userId, updateData);

        return {
            success: true,
            data: updatedUser,
            message: 'User updated successfully'
        };
    } catch (error) {
        throw {
            success: false,
            message: 'Error updating user',
            error: error.message
        };
    }
};

const deleteUser = async (userId) => {
    try {
        if (!userId || isNaN(userId)) {
            throw new Error('Invalid user ID');
        }

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

const getUserRoles = async (userId) => {
    try {
        if (!userId || isNaN(userId)) {
            throw new Error('Invalid user ID');
        }

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


module.exports = {
    getAllUsers,
    getUserById,
    createUser,
    updateUser,
    deleteUser,
    getUserRoles
};
