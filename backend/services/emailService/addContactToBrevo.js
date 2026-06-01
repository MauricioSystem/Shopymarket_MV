const { getClient } = require('./brevoClient');

/**
 * Agrega o actualiza un usuario como contacto en el CRM de Brevo.
 * Se llama al registrar un nuevo usuario o al reactivar su cuenta.
 * @param {Object} user - Datos del usuario
 */
const addContactToBrevo = async (user) => {
    try {
        const client = getClient();

        const attributes = {
            NOMBRE: user.first_name || '',
            APELLIDOS: user.last_name || '',
            SMS: user.phone || '',
            WHATSAPP: user.phone || '',
        };

        const listIds = [];
        if (process.env.BREVO_LIST_ID) {
            const listId = parseInt(process.env.BREVO_LIST_ID, 10);
            if (!isNaN(listId)) {
                listIds.push(listId);
            }
        }

        const payload = {
            email: user.email,
            updateEnabled: true,  // Si ya existe, actualiza en vez de fallar
            attributes,
        };

        if (listIds.length > 0) {
            payload.listIds = listIds;
        }

        await client.contacts.createContact(payload);

        console.log(`[Brevo CRM] ✅ Contacto sincronizado: ${user.email}`);
    } catch (error) {
        // En Brevo v5 SDK, la respuesta detallada de error está en error.body (objeto) o error.message
        const bodyObj = error.body || (error.response ? error.response.body : null);
        const status = error.statusCode || error.status || (error.response ? error.response.status : null);
        const errMessage = error.message || '';
        
        // Convertimos a string tanto el cuerpo del error como el mensaje para la búsqueda de patrones
        const errString = JSON.stringify(bodyObj) + ' ' + errMessage;

        // Si el error es de SMS duplicado, reintentamos sin enviar el SMS/Teléfono
        if (errString.includes('SMS is already associated') || errString.includes('SMS_ALREADY_ASSOCIATED') || errString.includes('duplicate_parameter')) {
            console.warn(`[Brevo CRM] ⚠️ El número SMS/Teléfono ya está asociado a otro contacto. Reintentando sincronización de ${user.email} sin teléfono...`);
            try {
                const client = getClient();
                const listIds = [];
                if (process.env.BREVO_LIST_ID) {
                    const listId = parseInt(process.env.BREVO_LIST_ID, 10);
                    if (!isNaN(listId)) {
                        listIds.push(listId);
                    }
                }
                const retryPayload = {
                    email: user.email,
                    updateEnabled: true,
                    attributes: {
                        NOMBRE: user.first_name || '',
                        APELLIDOS: user.last_name || '',
                    },
                };
                if (listIds.length > 0) {
                    retryPayload.listIds = listIds;
                }
                await client.contacts.createContact(retryPayload);
                console.log(`[Brevo CRM] ✅ Contacto sincronizado (omitido SMS duplicado): ${user.email}`);
                return;
            } catch (retryError) {
                const retryBody = retryError.body || retryError.message || '';
                console.error('[Brevo CRM] ❌ Error en reintento sin SMS:', JSON.stringify(retryBody));
            }
        }

        // Si el contacto ya existe (409), no es un error real
        if (errString.includes('Contact already exist') || status === 409) {
            console.log(`[Brevo CRM] ℹ️ Contacto ya existe: ${user.email}`);
        } else {
            console.error('[Brevo CRM] ❌ Error al sincronizar contacto:', JSON.stringify(bodyObj || errMessage));
        }
    }
};

module.exports = addContactToBrevo;
