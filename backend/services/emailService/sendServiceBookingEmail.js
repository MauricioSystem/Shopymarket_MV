const { getClient } = require('./brevoClient');
const serviceBookingTemplate = require('../../templates/serviceBookingTemplate');

const SENDER = {
    email: process.env.BREVO_SENDER_EMAIL,
    name: process.env.BREVO_SENDER_NAME,
};

/**
 * Envía email de solicitud de reserva de servicio.
 * @param {Object} user - Datos del cliente
 * @param {Object} service - Datos del servicio
 * @param {Object} provider - Datos del perfil del proveedor
 * @param {Object} bookingData - Datos del formulario de la reserva
 */
const sendServiceBookingEmail = async (user, service, provider, bookingData) => {
    try {
        const client = getClient();

        await client.transactionalEmails.sendTransacEmail({
            sender: SENDER,
            to: [{ email: user.email, name: `${user.first_name} ${user.last_name || ''}`.trim() }],
            subject: `Solicitud de reserva: ${service.name} 📅 — ShopyMarket`,
            htmlContent: serviceBookingTemplate(user, service, provider, bookingData),
        });

        console.log(`[Brevo Email] ✅ Solicitud de reserva del servicio "${service.name}" enviada a: ${user.email}`);
    } catch (error) {
        console.error('[Brevo Email] ❌ Error al enviar solicitud de reserva de servicio:', JSON.stringify(error.body || error.message));
    }
};

module.exports = sendServiceBookingEmail;
