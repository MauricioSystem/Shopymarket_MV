/**
 * brevoClient.js
 * Cliente Brevo centralizado para @getbrevo/brevo (nueva API 2024+).
 *
 * USO:
 *   const { Brevo, getClient } = require('./brevoClient');
 *   const client = getClient();
 *   await client.contacts.createContact({ email: '...' });
 */
const { BrevoClient, Brevo } = require('@getbrevo/brevo');

let _client = null;

/**
 * Retorna una instancia única del BrevoClient configurada con el API key.
 */
function getClient() {
    if (!_client) {
        _client = new BrevoClient({
            apiKey: process.env.BREVO_API_KEY,
            timeout: 3000,      // Timeout de 30 segundos para evitar cortes rápidos de conexión
            maxRetries: 4        // Reintentos automáticos para mitigar ConnectTimeoutError
        });
    }
    return _client;
}

module.exports = { getClient, Brevo };
