const { BrevoClient, Brevo } = require('@getbrevo/brevo');

let _client = null;

function parseBrevoError(error) {
    const body = error?.body ?? error?.response?.body;
    const message =
        (typeof body === 'object' && body?.message) ||
        error?.message ||
        'Error desconocido al enviar correo';

    if (/unrecognised ip address|unauthorized/i.test(String(message))) {
        const blockedIp = String(message).match(
            /unrecognised ip address\s+([0-9a-f:.]+)/i
        )?.[1];

        const ipHint = blockedIp
            ? ` Agrega esta IP en Brevo: ${blockedIp}.`
            : '';

        return `Brevo bloqueó el envío porque tu IP no está autorizada.${ipHint} Entra a https://app.brevo.com/security/authorised_ips y autoriza IPv4 e IPv6, o activa EMAIL_DEV_MODE=true en backend/.env para desarrollo local.`;
    }

    return String(message);
}

function isDevEmailMode() {
    return process.env.EMAIL_DEV_MODE === 'true' || process.env.NODE_ENV === 'development';
}

function getClient() {
    if (!_client) {
        if (!process.env.BREVO_API_KEY) {
            console.warn('[Brevo] BREVO_API_KEY no configurado en variables de entorno');
        }
        _client = new BrevoClient({
            apiKey: process.env.BREVO_API_KEY,
            timeout: 30000,
            maxRetries: 4
        });
    }
    return _client;
}

module.exports = { getClient, Brevo, parseBrevoError, isDevEmailMode };
