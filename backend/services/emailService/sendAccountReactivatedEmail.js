const { getClient } = require('./brevoClient');
const accountReactivatedTemplate = require('../../templates/accountReactivatedTemplate');

const SENDER = {
    email: process.env.BREVO_SENDER_EMAIL,
    name: process.env.BREVO_SENDER_NAME,
};

const sendAccountReactivatedEmail = async (user) => {
    try {
        const client = getClient();

        await client.transactionalEmails.sendTransacEmail({
            sender: SENDER,
            to: [{ email: user.email, name: `${user.first_name} ${user.last_name || ''}`.trim() }],
            subject: 'Tu cuenta de ShopyMarket ha sido reactivada',
            htmlContent: accountReactivatedTemplate(user),
        });

        console.log(`[Brevo Email] Reactivacion enviada a: ${user.email}`);
    } catch (error) {
        console.error('[Brevo Email] Error al enviar reactivacion:', error.message || error);
    }
};

module.exports = sendAccountReactivatedEmail;
