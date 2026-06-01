const BASE_STYLES = `
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Segoe UI', Arial, sans-serif; background: #f4f4f8; color: #1a1200; }
        .wrapper { max-width: 600px; margin: 0 auto; padding: 24px 16px; }
        .card { background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.08); }
        .header { background: linear-gradient(135deg, #f5d367 0%, #e6b800 100%); padding: 36px 32px; text-align: center; }
        .header-logo { font-size: 28px; font-weight: 800; color: #1a1200; letter-spacing: -0.5px; }
        .header-logo span { color: #6b3fa0; }
        .body { padding: 36px 32px; }
        .greeting { font-size: 22px; font-weight: 700; color: #1a1200; margin-bottom: 12px; }
        .text { font-size: 15px; line-height: 1.7; color: #444; margin-bottom: 20px; }
        .btn { display: inline-block; background: linear-gradient(135deg, #f5d367, #e6b800); color: #1a1200; font-weight: 700; font-size: 15px; padding: 14px 32px; border-radius: 8px; text-decoration: none; margin: 8px 0 20px; }
        .divider { border: none; border-top: 1px solid #eee; margin: 24px 0; }
        .footer { background: #f9f6ee; padding: 24px 32px; text-align: center; font-size: 12px; color: #888; border-top: 1px solid #ede8d5; }
        .badge { display: inline-block; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 700; text-transform: uppercase; }
        .badge-pending { background: #fff3cd; color: #856404; }
        .badge-picked_up { background: #cce5ff; color: #004085; }
        .badge-delivered { background: #d4edda; color: #155724; }
        .badge-cancelled { background: #f8d7da; color: #721c24; }
        .badge-shipped { background: #d1ecf1; color: #0c5460; }
        .order-table { width: 100%; border-collapse: collapse; margin: 20px 0; font-size: 14px; }
        .order-table th { background: #f9f6ee; padding: 10px 12px; text-align: left; font-weight: 700; color: #555; border-bottom: 2px solid #ede8d5; }
        .order-table td { padding: 10px 12px; border-bottom: 1px solid #f0ebe0; color: #333; }
        .order-total { text-align: right; font-size: 18px; font-weight: 800; color: #1a1200; margin-top: 16px; }
        .highlight-box { background: #fffbf0; border-left: 4px solid #f5d367; border-radius: 4px; padding: 16px 20px; margin: 20px 0; }
        .icon { font-size: 48px; text-align: center; display: block; margin: 0 auto 16px; }
    </style>
`;

const STATUS_LABELS = {
    pending: '⏳ Pendiente',
    picked_up: '🚚 Recogido',
    delivered: '✅ Entregado',
    cancelled: '❌ Cancelado',
    shipped: '📦 Enviado',
    processing: '🔄 Procesando',
};

module.exports = { BASE_STYLES, STATUS_LABELS };
