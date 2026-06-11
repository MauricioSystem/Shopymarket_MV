const { getClient } = require('./brevoClient');
const welcomeTemplate = require('../../templates/welcomeTemplate');

const SENDER = {
    email: process.env.BREVO_SENDER_EMAIL,
    name: process.env.BREVO_SENDER_NAME,
};

const sendWelcomeEmail = async (user) => {
    try {
        const client = getClient();

        await client.transactionalEmails.sendTransacEmail({
            sender: SENDER,
            to: [{ email: user.email, name: `${user.first_name} ${user.last_name || ''}`.trim() }],
            subject: 'Bienvenido/a a ShopyMarket',
            htmlContent: welcomeTemplate(user),
        });

        console.log(`[Brevo Email] Bienvenida enviada a: ${user.email}`);
    } catch (error) {
        console.error('[Brevo Email] Error al enviar bienvenida:', error.message || error);
    }
};

module.exports = sendWelcomeEmail;
