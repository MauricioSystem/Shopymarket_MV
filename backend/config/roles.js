module.exports = {
    roles: {
        SUPER_ADMIN: 'super_admin',
        ADMIN: 'admin',
        SELLER: 'seller',
        CUSTOMER: 'customer',
        DELIVERY: 'delivery'
    },
    permissions: {
        super_admin: ['manage_users', 'manage_products', 'manage_orders', 'view_reports'],
        admin: ['manage_users', 'manage_products', 'manage_orders'],
        seller: ['manage_products', 'view_own_products'],
        customer: ['browse_products', 'place_orders'],
        delivery: ['view_orders', 'update_delivery_status']
    }
};
