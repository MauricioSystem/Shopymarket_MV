require('dotenv').config();
const { getClient, parseBrevoError } = require('../services/emailService/brevoClient');

const to = process.argv[2] || process.env.BREVO_SENDER_EMAIL;

async function main() {
    if (!process.env.BREVO_API_KEY || !process.env.BREVO_SENDER_EMAIL) {
        console.error('Faltan BREVO_API_KEY o BREVO_SENDER_EMAIL en .env');
        process.exit(1);
    }

    console.log('EMAIL_DEV_MODE:', process.env.EMAIL_DEV_MODE);
    console.log('Enviando prueba a:', to);

    try {
        const client = getClient();
        await client.transactionalEmails.sendTransacEmail({
            sender: {
                email: process.env.BREVO_SENDER_EMAIL,
                name: process.env.BREVO_SENDER_NAME || 'ShopyMarket',
            },
            to: [{ email: to, name: 'Prueba' }],
            subject: 'Prueba Brevo ShopyMarket',
            htmlContent: '<p>Si ves esto, Brevo ya funciona.</p>',
        });
        console.log('OK: correo enviado por Brevo');
    } catch (error) {
        console.error('ERROR:', parseBrevoError(error));
        process.exit(1);
    }
}

main();
