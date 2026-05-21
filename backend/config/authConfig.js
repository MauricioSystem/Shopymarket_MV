module.exports = {
    authHeader: 'authorization',
    defaultRole: 'cliente',
    allowedRoles: ['super_admin', 'admin', 'cliente', 'repartidor'],
    jwtSecret: process.env.JWT_SECRET,
    jwtExpiresIn: '7d'
};
