const { BASE_STYLES } = require('./baseStyles');

/**
 * Template de bienvenida al registrarse
 */
const welcomeTemplate = (user) => `
<!DOCTYPE html>
<html lang="es">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">${BASE_STYLES}</head>
<body>
  <div class="wrapper">
    <div class="card">
      <div class="header">
        <div class="header-logo">Shopy<span>Market</span></div>
        <p style="margin-top:8px;font-size:14px;color:#6b3fa0;font-weight:600;">Tu mercado digital en Bolivia</p>
      </div>
      <div class="body">
        <span class="icon">🎉</span>
        <p class="greeting">¡Bienvenido/a, ${user.first_name}!</p>
        <p class="text">
          Tu cuenta en <strong>ShopyMarket</strong> ha sido creada exitosamente. 
          Ahora puedes explorar miles de productos, hacer pedidos y mucho más.
        </p>
        <div class="highlight-box">
          <p style="font-size:14px;color:#6b3fa0;"><strong>📧 Tu cuenta:</strong> ${user.email}</p>
        </div>
        <p class="text">¿Listo para empezar? Visita nuestra tienda y descubre lo mejor del mercado digital boliviano.</p>
        <hr class="divider">
        <p style="font-size:13px;color:#aaa;text-align:center;">Si no creaste esta cuenta, puedes ignorar este correo.</p>
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

module.exports = welcomeTemplate;
