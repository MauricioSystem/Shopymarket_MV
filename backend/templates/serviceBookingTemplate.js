const { BASE_STYLES } = require('./baseStyles');

/**
 * Template de solicitud de reserva de servicio
 */
const serviceBookingTemplate = (user, service, provider, bookingData) => {
    const formattedDate = new Date(bookingData.date).toLocaleDateString('es-ES', {
        year: 'numeric', month: 'long', day: 'numeric'
    });
    const formattedDateEnd = bookingData.dateEnd ? new Date(bookingData.dateEnd).toLocaleDateString('es-ES', {
        year: 'numeric', month: 'long', day: 'numeric'
    }) : null;

    const dateDisplay = bookingData.dateType === 'range' 
        ? `Desde el ${formattedDate} hasta el ${formattedDateEnd}`
        : `El día ${formattedDate}`;

    return `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  ${BASE_STYLES}
</head>
<body>
  <div class="wrapper">
    <div class="card">
      <div class="header" style="background: linear-gradient(135deg, #a78bfa 0%, #6b21a8 100%);">
        <div class="header-logo" style="color: #ffffff;">Shopy<span>Market</span></div>
        <p style="margin-top:8px;font-size:13px;color:#f3e8ff;font-weight:600;">Solicitud de Reserva de Servicio</p>
      </div>

      <div class="body">
        <span class="icon">📅</span>
        <p class="greeting">¡Reserva de servicio solicitada, ${user.first_name}!</p>
        <p class="text">
          Hemos registrado tu solicitud para el siguiente servicio. El profesional se pondrá en contacto contigo pronto para acordar los detalles.
        </p>

        <!-- DETALLES DE RESERVA -->
        <table style="width:100%;border-collapse:collapse;margin:16px 0;font-size:14px;">
          <tr>
            <td style="padding:8px 0;color:#888;width:40%;">Servicio</td>
            <td style="padding:8px 0;font-weight:700;color:#1a1200;">${service.name}</td>
          </tr>
          ${provider ? `
          <tr>
            <td style="padding:8px 0;color:#888;">Proveedor</td>
            <td style="padding:8px 0;font-weight:600;color:#6b21a8;">🔧 ${provider.name}</td>
          </tr>` : ''}
          <tr>
            <td style="padding:8px 0;color:#888;">Fecha solicitada</td>
            <td style="padding:8px 0;font-weight:600;color:#1a1200;">${dateDisplay}</td>
          </tr>
          <tr>
            <td style="padding:8px 0;color:#888;">Hora de preferencia</td>
            <td style="padding:8px 0;color:#333;">${bookingData.time} hrs</td>
          </tr>
          <tr>
            <td style="padding:8px 0;color:#888;">Precio base</td>
            <td style="padding:8px 0;font-weight:700;color:#6b21a8;">Bs. ${parseFloat(service.price || 0).toFixed(2)}</td>
          </tr>
          ${service.estimated_time ? `
          <tr>
            <td style="padding:8px 0;color:#888;">Tiempo estimado</td>
            <td style="padding:8px 0;color:#333;">${service.estimated_time}</td>
          </tr>` : ''}
          ${bookingData.notes ? `
          <tr>
            <td style="padding:8px 0;color:#888;vertical-align:top;">Notas adicionales</td>
            <td style="padding:8px 0;color:#555;font-style:italic;background:#f9f6ee;border-radius:4px;padding:8px 12px;display:block;margin-top:4px;">"${bookingData.notes}"</td>
          </tr>` : ''}
        </table>

        <hr class="divider">
        <p class="text" style="font-size:13px;color:#666;text-align:center;">
          Recuerda coordinar el pago directo y la facturación con el proveedor del servicio.
        </p>
      </div>

      <div class="footer">
        <p>© ${new Date().getFullYear()} ShopyMarket · Bolivia</p>
        <p style="margin-top:6px;">Este es un correo automático, por favor no respondas a este mensaje.</p>
      </div>
    </div>
  </div>
</body>
</html>
`;
};

module.exports = serviceBookingTemplate;
