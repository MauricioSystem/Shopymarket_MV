module.exports = {
    roles: {
        SUPER_ADMIN: 'super_admin',
        ADMIN: 'admin',
        CLIENTE: 'cliente'
    },
    permissions: {
        super_admin: ['manage_users', 'manage_products', 'manage_orders', 'view_reports'],
        admin: ['manage_products', 'view_own_products', 'manage_orders'],
        cliente: ['browse_products', 'place_orders']
    }
};

