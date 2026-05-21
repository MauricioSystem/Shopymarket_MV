require('dotenv').config();

const jwtSecret = process.env.JWT_SECRET;

if (!jwtSecret) {
    throw new Error('JWT_SECRET environment variable is required');
}

module.exports = {
    authHeader: 'authorization',
    defaultRole: 'cliente',
    allowedRoles: ['super_admin', 'admin', 'cliente', 'repartidor'],
    jwtSecret,
    jwtExpiresIn: '7d'
};
