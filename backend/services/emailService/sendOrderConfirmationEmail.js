const { getClient } = require('./brevoClient');
const orderConfirmationTemplate = require('../../templates/orderConfirmationTemplate');

const SENDER = {
    email: process.env.BREVO_SENDER_EMAIL,
    name: process.env.BREVO_SENDER_NAME,
};

/**
 * Envía email de confirmación de pedido al cliente.
 * @param {Object} user  - Datos del cliente
 * @param {Object} order - Datos de la orden creada
 * @param {Array}  items - Detalle de los items del pedido
 */
const sendOrderConfirmationEmail = async (user, order, items = []) => {
    try {
        const client = getClient();

        await client.transactionalEmails.sendTransacEmail({
            sender: SENDER,
            to: [{ email: user.email, name: `${user.first_name} ${user.last_name || ''}`.trim() }],
            subject: `Pedido #${order.id} confirmado ✅ — ShopyMarket`,
            htmlContent: orderConfirmationTemplate(user, order, items),
        });

        console.log(`[Brevo Email] ✅ Confirmación de pedido #${order.id} enviada a: ${user.email}`);
    } catch (error) {
        console.error('[Brevo Email] ❌ Error al enviar confirmación de pedido:', JSON.stringify(error.body || error.message));
    }
};

module.exports = sendOrderConfirmationEmail;
