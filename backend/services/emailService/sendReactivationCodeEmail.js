const { getClient, parseBrevoError, isDevEmailMode } = require('./brevoClient');

const SENDER = {
    email: process.env.BREVO_SENDER_EMAIL,
    name: process.env.BREVO_SENDER_NAME,
};

const sendReactivationCodeEmail = async (user, code) => {
    if (isDevEmailMode()) {
        console.log(`[Email DEV] Código de reactivación para ${user.email}: ${code} (vence en 5 min)`);
        return;
    }

    if (!process.env.BREVO_API_KEY || !SENDER.email) {
        throw new Error('El servicio de correo no está configurado');
    }

    const client = getClient();
    const name = `${user.first_name || ''} ${user.last_name || ''}`.trim() || user.email;

    try {
        await client.transactionalEmails.sendTransacEmail({
            sender: SENDER,
            to: [{ email: user.email, name }],
            subject: 'Codigo para recuperar tu cuenta ShopyMarket',
            htmlContent: `
            <div style="font-family:Arial,sans-serif;color:#1a1200;line-height:1.5">
                <h2>Recuperacion de cuenta</h2>
                <p>Usa este codigo para recuperar tu cuenta eliminada:</p>
                <p style="font-size:28px;font-weight:700;letter-spacing:8px;margin:20px 0">${code}</p>
                <p>El codigo vence en 5 minutos.</p>
                <p>Si no solicitaste este correo, puedes ignorarlo.</p>
            </div>
        `,
        });
        console.log(`[Brevo Email] Código de reactivación enviado a: ${user.email}`);
    } catch (error) {
        const message = parseBrevoError(error);
        console.error('[Brevo Email] Error al enviar código de reactivación:', message);
        throw new Error(message);
    }
};

module.exports = sendReactivationCodeEmail;
