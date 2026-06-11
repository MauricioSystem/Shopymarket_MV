/**
 * Migration Script: Remove delivery_user_id from orders table
 * This script removes the delivery_user_id column and related delivery management functionality
 * since delivery management is being removed from the system.
 * 
 * Run this script manually or integrate it into your deployment process
 */

const pool = require('../src/db/database');

const runMigration = async () => {
    const client = await pool.connect();
    try {
        console.log('[Migration] Starting: Remove delivery_user_id from orders table...');

        await client.query('BEGIN');

        // Step 1: Check if the column exists
        const columnCheckResult = await client.query(`
            SELECT EXISTS (
                SELECT 1 FROM information_schema.columns
                WHERE table_name = 'orders' AND column_name = 'delivery_user_id'
            )
        `);

        if (!columnCheckResult.rows[0].exists) {
            console.log('[Migration] Column delivery_user_id does not exist. Migration already completed.');
            await client.query('ROLLBACK');
            return;
        }

        // Step 2: Drop foreign key constraint
        await client.query(`
            ALTER TABLE orders
            DROP CONSTRAINT IF EXISTS orders_delivery_user_id_fkey
        `);
        console.log('[Migration] ✓ Dropped foreign key constraint');

        // Step 3: Drop the column
        await client.query(`
            ALTER TABLE orders
            DROP COLUMN delivery_user_id
        `);
        console.log('[Migration] ✓ Dropped delivery_user_id column');

        // Step 4: Remove delivery role from role table
        await client.query(`
            DELETE FROM roles WHERE name = 'repartidor'
        `);
        console.log('[Migration] ✓ Removed repartidor role');

        // Step 5: Remove users with only delivery role
        await client.query(`
            DELETE FROM user_roles
            WHERE user_id IN (
                SELECT ur1.user_id FROM user_roles ur1
                WHERE ur1.role_id = (SELECT id FROM roles WHERE name = 'repartidor')
                AND NOT EXISTS (
                    SELECT 1 FROM user_roles ur2
                    WHERE ur2.user_id = ur1.user_id
                    AND ur2.role_id != (SELECT id FROM roles WHERE name = 'repartidor')
                )
            )
        `);
        console.log('[Migration] ✓ Removed user_roles for delivery users');

        // Step 6: Drop deliveries table if it exists
        await client.query(`
            DROP TABLE IF EXISTS deliveries
        `);
        console.log('[Migration] ✓ Dropped deliveries table');

        await client.query('COMMIT');
        console.log('[Migration] ✓ Migration completed successfully!');
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('[Migration] ✗ Error during migration:', error.message);
        throw error;
    } finally {
        client.release();
        await pool.end();
    }
};

// Run the migration
runMigration()
    .then(() => {
        console.log('[Migration] Process finished.');
        process.exit(0);
    })
    .catch((error) => {
        console.error('[Migration] Process failed:', error);
        process.exit(1);
    });
