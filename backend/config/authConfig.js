module.exports = {
    authHeader: 'authorization',
    defaultRole: 'cliente',
    allowedRoles: ['super_admin', 'admin', 'cliente', 'repartidor'],
    jwtSecret: process.env.JWT_SECRET || 'shopymarket_jwt_secret_2026_secure',
    jwtExpiresIn: '7d'
};
