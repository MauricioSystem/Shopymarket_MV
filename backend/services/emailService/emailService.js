/**
 * emailService.js
 * Exportador unificado de las funciones de servicio de correo de Brevo.
 * Cada función ha sido separada en su propio archivo para mejorar la modularidad.
 */

const addContactToBrevo = require('./addContactToBrevo');
const sendWelcomeEmail = require('./sendWelcomeEmail');
const sendOrderConfirmationEmail = require('./sendOrderConfirmationEmail');
const sendOrderStatusUpdateEmail = require('./sendOrderStatusUpdateEmail');
const sendAccountReactivatedEmail = require('./sendAccountReactivatedEmail');
const sendServiceBookingEmail = require('./sendServiceBookingEmail');

module.exports = {
    addContactToBrevo,
    sendWelcomeEmail,
    sendOrderConfirmationEmail,
    sendOrderStatusUpdateEmail,
    sendAccountReactivatedEmail,
    sendServiceBookingEmail,
};
