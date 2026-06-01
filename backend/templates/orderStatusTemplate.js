const { BASE_STYLES, STATUS_LABELS } = require('./baseStyles');

/**
 * Template de actualización de estado de pedido
 */
const orderStatusTemplate = (user, order) => {
    const statusLabel = STATUS_LABELS[order.status] || order.status;
    const badgeClass = `badge-${order.status}`;

    const statusMessages = {
        pending: 'Tu pedido está siendo revisado por el vendedor.',
        processing: 'El vendedor está preparando tu pedido.',
        picked_up: 'El repartidor ya tiene tu pedido y está en camino.',
        shipped: 'Tu pedido ha sido despachado y está en camino.',
        delivered: '¡Tu pedido ha sido entregado exitosamente! Esperamos que disfrutes tu compra.',
        cancelled: 'Lamentamos informarte que tu pedido ha sido cancelado. Si tienes preguntas, contáctanos.',
    };

    const message = statusMessages[order.status] || 'El estado de tu pedido ha sido actualizado.';

    return `
<!DOCTYPE html>
<html lang="es">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">${BASE_STYLES}</head>
<body>
  <div class="wrapper">
    <div class="card">
      <div class="header">
        <div class="header-logo">Shopy<span>Market</span></div>
        <p style="margin-top:8px;font-size:14px;color:#6b3fa0;font-weight:600;">Actualización de Pedido</p>
      </div>
      <div class="body">
        <span class="icon">🔔</span>
        <p class="greeting">Hola, ${user.first_name}</p>
        <p class="text">Hay una actualización en tu pedido <strong>#${order.id}</strong>:</p>
        
        <div class="highlight-box" style="text-align:center;">
          <p style="font-size:13px;color:#888;margin-bottom:8px;">Estado actual</p>
          <span class="badge ${badgeClass}" style="font-size:15px;padding:8px 20px;">${statusLabel}</span>
        </div>

        <p class="text">${message}</p>

        <hr class="divider">
        <p style="font-size:13px;color:#aaa;text-align:center;">
          Total del pedido: <strong>Bs. ${parseFloat(order.total || 0).toFixed(2)}</strong>
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

module.exports = orderStatusTemplate;
