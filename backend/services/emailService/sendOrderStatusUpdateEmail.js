const { getClient } = require('./brevoClient');
const orderStatusTemplate = require('../../templates/orderStatusTemplate');

const SENDER = {
    email: process.env.BREVO_SENDER_EMAIL,
    name: process.env.BREVO_SENDER_NAME,
};

/**
 * Envía notificación de cambio de estado del pedido.
 * @param {Object} user  - Datos del cliente
 * @param {Object} order - Datos actualizados de la orden
 */
const sendOrderStatusUpdateEmail = async (user, order) => {
    try {
        const client = getClient();

        const STATUS_SUBJECTS = {
            pending: `Pedido #${order.id} recibido ⏳ — ShopyMarket`,
            processing: `Tu pedido #${order.id} está siendo preparado 🔄`,
            picked_up: `Tu pedido #${order.id} ya está en camino 🚚`,
            shipped: `Tu pedido #${order.id} fue despachado 📦`,
            delivered: `Tu pedido #${order.id} fue entregado ✅`,
            cancelled: `Tu pedido #${order.id} fue cancelado ❌`,
        };

        await client.transactionalEmails.sendTransacEmail({
            sender: SENDER,
            to: [{ email: user.email, name: `${user.first_name} ${user.last_name || ''}`.trim() }],
            subject: STATUS_SUBJECTS[order.status] || `Actualización de tu pedido #${order.id}`,
            htmlContent: orderStatusTemplate(user, order),
        });

        console.log(`[Brevo Email] ✅ Estado del pedido #${order.id} (${order.status}) enviado a: ${user.email}`);
    } catch (error) {
        console.error('[Brevo Email] ❌ Error al enviar estado de pedido:', JSON.stringify(error.body || error.message));
    }
};

module.exports = sendOrderStatusUpdateEmail;
