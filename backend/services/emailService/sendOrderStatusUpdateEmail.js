const { getClient } = require('./brevoClient');
const orderStatusTemplate = require('../../templates/orderStatusTemplate');

const SENDER = {
    email: process.env.BREVO_SENDER_EMAIL,
    name: process.env.BREVO_SENDER_NAME,
};

const sendOrderStatusUpdateEmail = async (user, order) => {
    try {
        const client = getClient();

        const STATUS_SUBJECTS = {
            pending: `Pedido #${order.id} recibido - ShopyMarket`,
            confirmed: `Tu pedido #${order.id} esta siendo preparado`,
            sent: `Tu pedido #${order.id} ya esta en camino`,
            delivered: `Tu pedido #${order.id} fue entregado`,
            cancelled: `Tu pedido #${order.id} fue cancelado`,
        };

        await client.transactionalEmails.sendTransacEmail({
            sender: SENDER,
            to: [{ email: user.email, name: `${user.first_name} ${user.last_name || ''}`.trim() }],
            subject: STATUS_SUBJECTS[order.status] || `Actualizacion de tu pedido #${order.id}`,
            htmlContent: orderStatusTemplate(user, order),
        });

        console.log(`[Brevo Email] Estado del pedido #${order.id} (${order.status}) enviado a: ${user.email}`);
    } catch (error) {
        console.error('[Brevo Email] Error al enviar estado de pedido:', error.message || error);
    }
};

module.exports = sendOrderStatusUpdateEmail;
