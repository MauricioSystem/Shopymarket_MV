const userModel = require('../../models/userModel');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const { validateEmail } = require('../validators');
//NUEVO: PARA BREVO
const emailService = require('../emailService/emailService');

const reactivateUser = async (userData) => {
    try {
        if (!userData?.email || !userData?.password) {
            throw new Error('Email and password are required');
        }

        validateEmail(userData.email);

        const email = userData.email.toLowerCase().trim();
        const user = await userModel.getUserByEmail(email);

        if (!user) {
            throw new Error('User not found');
        }

        if (user.status === 'active') {
            throw new Error('La cuenta ya está activa. Inicia sesión normalmente.');
        }

        if (user.status === 'inactive') {
            throw new Error('La cuenta está desactivada y no puede reactivarse automáticamente. Contacta soporte.');
        }

        let passwordMatches = await bcrypt.compare(userData.password, user.password_hash);
        let migratedLegacyHash = false;

        if (!passwordMatches) {
            const legacyHash = crypto.createHash('sha256').update(userData.password).digest('hex');
            if (legacyHash === user.password_hash) {
                passwordMatches = true;
                migratedLegacyHash = true;
            }
        }

        if (!passwordMatches) {
            throw new Error('Credenciales inválidas');
        }

        if (migratedLegacyHash) {
            const newHash = await bcrypt.hash(userData.password, 10);
            await userModel.updatePasswordHash(user.id, newHash);
        }

        const restoredUser = await userModel.reactivateUser(user.id);
        const roles = await userModel.getUserRoles(user.id);
        const primaryRole = roles[0]?.name || null;

        // ── Brevo: re-sincronizar contacto y enviar email de reactivación ──
        emailService.addContactToBrevo(restoredUser);
        emailService.sendAccountReactivatedEmail(restoredUser);

        return {
            success: true,
            data: {
                ...restoredUser,
                role: primaryRole,
                roles
            },
            message: 'Cuenta reactivada correctamente'
        };
    } catch (error) {
        throw {
            success: false,
            message: 'Error al reactivar la cuenta',
            error: error.message
        };
    }
};

module.exports = reactivateUser;
