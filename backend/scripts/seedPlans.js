const pool = require('../src/db/database');

(async () => {
    try {
        console.log('Inserting default subscription plans...');
        const seedQuery = `
            INSERT INTO subscription_plans
            (name, type, price, discount, free_shipping, points_enabled, featured_products, reduced_commission, search_priority, status)
            VALUES
            ('Básico Usuario', 'user', 0.00, 0.00, false, true, false, false, false, 'active'),
            ('Premium Usuario', 'user', 10.00, 10.00, true, true, false, false, false, 'active'),
            ('Básico Vendedor', 'admin', 0.00, 0.00, false, false, false, false, false, 'active'),
            ('Premium Vendedor', 'admin', 20.00, 0.00, false, false, true, true, true, 'active')
            ON CONFLICT (name) DO NOTHING
        `;
        await pool.query(seedQuery);
        console.log('Default plans seeded successfully.');
        process.exit(0);
    } catch (error) {
        console.error('Error seeding plans:', error);
        process.exit(1);
    }
})();
