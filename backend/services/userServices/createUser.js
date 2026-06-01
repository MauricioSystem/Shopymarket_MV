const userModel = require('../../models/userModel');
const bcrypt = require('bcryptjs');
const {
    validatePhone,
    validateEmail,
    validatePassword,
} = require('../validators');
const emailService = require('../emailService/emailService');


const createUser = async (userData) => {
    try {
        if (!userData.first_name || !userData.email || !userData.password) {
            throw new Error('first_name, email and password are required');
        }

        validateEmail(userData.email);

        const existingUser = await userModel.getUserByEmail(userData.email);
        if (existingUser) {
            if (existingUser.status === 'deleted') {
                throw new Error('Este correo está asociado a una cuenta eliminada. Usa el formulario de reactivación para recuperar tu cuenta.');
            }
            if (existingUser.status === 'inactive') {
                throw new Error('Este correo está asociado a una cuenta desactivada y no puede registrarse de nuevo.');
            }
            throw new Error('Email already registered');
        }

        validatePassword(userData.password);

        if (userData.phone) {
            validatePhone(userData.phone);
        }

        const password_hash = await bcrypt.hash(userData.password, 10);

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

        const roleId = userData.role_id ? parseInt(userData.role_id, 10) : null;
        if (roleId && !isNaN(roleId)) {
            await userModel.assignRoleToUser(user.id, roleId);
        }

        const roles = await userModel.getUserRoles(user.id);
        const primaryRole = roles[0]?.name || null;

        delete user.password_hash;

        // ── Brevo: sincronizar contacto al CRM y enviar bienvenida (no bloquea el registro) ──
        emailService.addContactToBrevo(user);
        emailService.sendWelcomeEmail(user);

        return {
            success: true,
            data: {
                ...user,
                role: primaryRole,
                roles
            },
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

module.exports = createUser;
