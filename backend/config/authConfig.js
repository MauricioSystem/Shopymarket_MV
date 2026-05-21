module.exports = {
    authHeader: 'authorization',
    userIdHeader: 'x-user-id',
    userRoleHeader: 'x-user-role',
    defaultRole: 'customer',
    allowedRoles: ['super_admin', 'admin', 'seller', 'customer', 'delivery']
};
