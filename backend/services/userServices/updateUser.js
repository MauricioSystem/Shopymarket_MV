const userModel = require('../../models/userModel');
const bcrypt = require('bcryptjs');
//NUEVO: para BREVO
const emailService = require('../emailService/emailService');

const {
    validatePhone,
    validateEmail,
    validatePassword,
    validateUserId,
} = require('../validators');

const updateUser = async (userId, userData) => {
    try {
        validateUserId(userId);

        const user = await userModel.getUserById(userId);
        if (!user) {
            throw new Error('User not found');
        }

        if (userData.email) {
            validateEmail(userData.email);

            const existingUser = await userModel.getUserByEmail(userData.email);
            if (existingUser && existingUser.id !== parseInt(userId, 10)) {
                throw new Error('Email already in use');
            }
        }

        if (userData.phone) {
            validatePhone(userData.phone);
        }

        if (userData.password) {
            validatePassword(userData.password);
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

        if (userData.email) {
            updateData.email = userData.email.toLowerCase().trim();
        }

        if (userData.password) {
            updateData.password_hash = await bcrypt.hash(userData.password, 10);
        }

        const updatedUser = await userModel.updateUser(userId, updateData);

        // ── Brevo: actualizar contacto en el CRM ──
        emailService.addContactToBrevo(updatedUser);

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

module.exports = updateUser;
