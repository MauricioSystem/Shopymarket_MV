const { getClient } = require('./brevoClient');
const accountReactivatedTemplate = require('../../templates/accountReactivatedTemplate');

const SENDER = {
    email: process.env.BREVO_SENDER_EMAIL,
    name: process.env.BREVO_SENDER_NAME,
};

/**
 * Envía email de confirmación de reactivación de cuenta.
 * @param {Object} user - Datos del usuario reactivado
 */
const sendAccountReactivatedEmail = async (user) => {
    try {
        const client = getClient();

        await client.transactionalEmails.sendTransacEmail({
            sender: SENDER,
            to: [{ email: user.email, name: `${user.first_name} ${user.last_name || ''}`.trim() }],
            subject: '¡Tu cuenta de ShopyMarket ha sido reactivada! ✅',
            htmlContent: accountReactivatedTemplate(user),
        });

        console.log(`[Brevo Email] ✅ Reactivación enviada a: ${user.email}`);
    } catch (error) {
        console.error('[Brevo Email] ❌ Error al enviar reactivación:', JSON.stringify(error.body || error.message));
    }
};

module.exports = sendAccountReactivatedEmail;
