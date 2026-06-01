const { BASE_STYLES } = require('./baseStyles');

/**
 * Template de confirmación de pedido
 */
const orderConfirmationTemplate = (user, order, items = []) => {
    const itemRows = items.map(item => `
        <tr>
            <td style="padding:10px 12px;border-bottom:1px solid #f0ebe0;color:#333;">
                ${item.product_name || item.service_name || 'Producto'}
            </td>
            <td style="padding:10px 12px;border-bottom:1px solid #f0ebe0;text-align:center;color:#333;">
                ${item.quantity}
            </td>
            <td style="padding:10px 12px;border-bottom:1px solid #f0ebe0;text-align:right;color:#333;">
                Bs. ${parseFloat(item.unit_price).toFixed(2)}
            </td>
            <td style="padding:10px 12px;border-bottom:1px solid #f0ebe0;text-align:right;font-weight:600;color:#1a1200;">
                Bs. ${parseFloat(item.subtotal).toFixed(2)}
            </td>
        </tr>
    `).join('');

    const orderTypeLabel  = order.order_type === 'delivery' ? '🚚 Entrega a domicilio' : '🏪 Recojo en tienda';
    const orderTypeBg     = order.order_type === 'delivery' ? '#e8f4ff' : '#f0fff4';
    const orderTypeColor  = order.order_type === 'delivery' ? '#0c5460'  : '#155724';

    const fechaPedido = new Date(order.created_at || Date.now()).toLocaleString('es-BO', {
        year: 'numeric', month: 'long', day: 'numeric',
        hour: '2-digit', minute: '2-digit',
    });

    const hasDiscount   = parseFloat(order.discount || 0) > 0;
    const hasShipping   = parseFloat(order.shipping_cost || 0) > 0;

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

      <!-- HEADER -->
      <div class="header">
        <div class="header-logo">Shopy<span>Market</span></div>
        <p style="margin-top:8px;font-size:13px;color:#6b3fa0;font-weight:600;">Confirmación de Pedido</p>
      </div>

      <!-- BODY -->
      <div class="body">
        <span class="icon">📦</span>
        <p class="greeting">¡Pedido confirmado, ${user.first_name}!</p>
        <p class="text">
          Hemos recibido tu pedido y está siendo procesado. 
          A continuación encontrarás el resumen completo.
        </p>

        <!-- INFO PEDIDO -->
        <table style="width:100%;border-collapse:collapse;margin:16px 0;font-size:14px;">
          <tr>
            <td style="padding:8px 0;color:#888;width:40%;">Número de pedido</td>
            <td style="padding:8px 0;font-weight:700;color:#1a1200;">#${order.id}</td>
          </tr>
          <tr>
            <td style="padding:8px 0;color:#888;">Fecha</td>
            <td style="padding:8px 0;color:#333;">${fechaPedido}</td>
          </tr>
          ${order.store_name ? `
          <tr>
            <td style="padding:8px 0;color:#888;">Tienda</td>
            <td style="padding:8px 0;font-weight:600;color:#6b3fa0;">🏬 ${order.store_name}${order.store_city ? ` — ${order.store_city}` : ''}</td>
          </tr>` : ''}
          <tr>
            <td style="padding:8px 0;color:#888;">Tipo de pedido</td>
            <td style="padding:8px 0;">
              <span style="background:${orderTypeBg};color:${orderTypeColor};padding:3px 10px;border-radius:12px;font-size:12px;font-weight:700;">
                ${orderTypeLabel}
              </span>
            </td>
          </tr>
          ${order.delivery_address ? `
          <tr>
            <td style="padding:8px 0;color:#888;vertical-align:top;">Dirección de entrega</td>
            <td style="padding:8px 0;color:#333;">${order.delivery_address}</td>
          </tr>` : ''}
          <tr>
            <td style="padding:8px 0;color:#888;">Estado</td>
            <td style="padding:8px 0;">
              <span style="background:#fff3cd;color:#856404;padding:3px 10px;border-radius:12px;font-size:12px;font-weight:700;">
                ⏳ Pendiente
              </span>
            </td>
          </tr>
        </table>

        <hr class="divider">

        <!-- PRODUCTOS -->
        ${items.length > 0 ? `
        <p style="font-size:14px;font-weight:700;color:#1a1200;margin-bottom:8px;">🛒 Productos del pedido</p>
        <table style="width:100%;border-collapse:collapse;font-size:14px;">
          <thead>
            <tr style="background:#f9f6ee;">
              <th style="padding:10px 12px;text-align:left;font-weight:700;color:#555;border-bottom:2px solid #ede8d5;">Producto</th>
              <th style="padding:10px 12px;text-align:center;font-weight:700;color:#555;border-bottom:2px solid #ede8d5;">Cant.</th>
              <th style="padding:10px 12px;text-align:right;font-weight:700;color:#555;border-bottom:2px solid #ede8d5;">Precio u.</th>
              <th style="padding:10px 12px;text-align:right;font-weight:700;color:#555;border-bottom:2px solid #ede8d5;">Subtotal</th>
            </tr>
          </thead>
          <tbody>${itemRows}</tbody>
        </table>
        ` : ''}

        <!-- RESUMEN DE PRECIOS -->
        <div style="background:#f9f6ee;border-radius:8px;padding:16px 20px;margin-top:16px;">
          <table style="width:100%;font-size:14px;border-collapse:collapse;">
            <tr>
              <td style="padding:5px 0;color:#666;">Subtotal</td>
              <td style="padding:5px 0;text-align:right;color:#333;">Bs. ${parseFloat(order.subtotal || 0).toFixed(2)}</td>
            </tr>
            ${hasShipping ? `
            <tr>
              <td style="padding:5px 0;color:#666;">Costo de envío</td>
              <td style="padding:5px 0;text-align:right;color:#333;">Bs. ${parseFloat(order.shipping_cost).toFixed(2)}</td>
            </tr>` : ''}
            ${hasDiscount ? `
            <tr>
              <td style="padding:5px 0;color:#28a745;">Descuento</td>
              <td style="padding:5px 0;text-align:right;color:#28a745;">-Bs. ${parseFloat(order.discount).toFixed(2)}</td>
            </tr>` : ''}
            <tr>
              <td colspan="2"><hr style="border:none;border-top:1px solid #ede8d5;margin:8px 0;"></td>
            </tr>
            <tr>
              <td style="padding:4px 0;font-size:16px;font-weight:800;color:#1a1200;">TOTAL</td>
              <td style="padding:4px 0;text-align:right;font-size:20px;font-weight:800;color:#6b3fa0;">
                Bs. ${parseFloat(order.total || 0).toFixed(2)}
              </td>
            </tr>
          </table>
        </div>

        <p class="text" style="margin-top:20px;text-align:center;font-size:13px;color:#888;">
          Te notificaremos por correo cuando el estado de tu pedido cambie.
        </p>
      </div>

      <!-- FOOTER -->
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

module.exports = orderConfirmationTemplate;
