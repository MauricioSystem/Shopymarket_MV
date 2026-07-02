const pool = require('../src/db/database');

const migrateSubscriptions = async () => {
    try {
        console.log('Starting subscriptions migration...');

        // Create subscription_plans table
        await pool.query(`
            CREATE TABLE IF NOT EXISTS subscription_plans (
                id SERIAL PRIMARY KEY,
                name VARCHAR(100) NOT NULL UNIQUE,
                type VARCHAR(50) NOT NULL, -- 'user' or 'admin'
                price DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
                discount DECIMAL(5, 2) DEFAULT 0.00, -- e.g., 5.00 for 5%
                free_shipping BOOLEAN DEFAULT false,
                points_enabled BOOLEAN DEFAULT false,
                featured_products BOOLEAN DEFAULT false,
                reduced_commission BOOLEAN DEFAULT false,
                search_priority BOOLEAN DEFAULT false,
                status VARCHAR(20) DEFAULT 'active',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);
        console.log('Table subscription_plans checked/created.');

        // Create user_subscriptions table
        await pool.query(`
            CREATE TABLE IF NOT EXISTS user_subscriptions (
                id SERIAL PRIMARY KEY,
                user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
                plan_id INTEGER REFERENCES subscription_plans(id) ON DELETE SET NULL,
                start_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                end_date TIMESTAMP,
                status VARCHAR(20) DEFAULT 'active',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);
        console.log('Table user_subscriptions checked/created.');

        // Seed default plans if missing (idempotent — safe on every deploy)
        const defaultPlans = [
            ['Básico Usuario', 'user', 0.00, 0.00, false, true, false, false, false],
            ['Premium Usuario', 'user', 10.00, 10.00, true, true, false, false, false],
            ['Básico Vendedor', 'admin', 0.00, 0.00, false, false, false, false, false],
            ['Premium Vendedor', 'admin', 20.00, 0.00, false, false, true, true, true],
        ];

        for (const [name, type, price, discount, freeShipping, pointsEnabled, featuredProducts, reducedCommission, searchPriority] of defaultPlans) {
            await pool.query(
                `INSERT INTO subscription_plans
                  (name, type, price, discount, free_shipping, points_enabled, featured_products, reduced_commission, search_priority, status)
                 VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 'active')
                 ON CONFLICT (name) DO NOTHING`,
                [name, type, price, discount, freeShipping, pointsEnabled, featuredProducts, reducedCommission, searchPriority]
            );
        }
        console.log('Default plans ensured.');

        console.log('Subscription migration completed successfully.');
        process.exit(0);
    } catch (error) {
        console.error('Migration error:', error);
        process.exit(1);
    }
};

migrateSubscriptions();
