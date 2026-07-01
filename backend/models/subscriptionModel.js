const pool = require('../src/db/database');

const getAllPlans = async () => {
    const query = `
        SELECT id, name, type, price, discount, free_shipping, points_enabled,
               featured_products, reduced_commission, search_priority, status
        FROM subscription_plans
        WHERE status = 'active'
        ORDER BY price ASC
    `;
    const result = await pool.query(query);
    return result.rows;
};

const getPlanById = async (planId) => {
    const query = `
        SELECT id, name, type, price, discount, free_shipping, points_enabled,
               featured_products, reduced_commission, search_priority, status
        FROM subscription_plans
        WHERE id = $1
    `;
    const result = await pool.query(query, [planId]);
    return result.rows[0] || null;
};

const getActiveSubscription = async (userId) => {
    const query = `
        SELECT us.id, us.user_id, us.plan_id, us.start_date, us.end_date, us.status,
               sp.name AS plan_name, sp.type AS plan_type, sp.price AS plan_price,
               sp.discount, sp.free_shipping, sp.points_enabled,
               sp.featured_products, sp.reduced_commission, sp.search_priority
        FROM user_subscriptions us
        JOIN subscription_plans sp ON us.plan_id = sp.id
        WHERE us.user_id = $1
          AND us.status = 'active'
          AND (us.end_date IS NULL OR us.end_date > NOW())
        ORDER BY us.start_date DESC
        LIMIT 1
    `;
    const result = await pool.query(query, [userId]);
    return result.rows[0] || null;
};

const getUserSubscriptions = async (userId) => {
    const query = `
        SELECT us.id, us.user_id, us.plan_id, us.start_date, us.end_date, us.status,
               sp.name AS plan_name, sp.type AS plan_type, sp.price AS plan_price,
               sp.discount, sp.free_shipping, sp.points_enabled,
               sp.featured_products, sp.reduced_commission, sp.search_priority
        FROM user_subscriptions us
        JOIN subscription_plans sp ON us.plan_id = sp.id
        WHERE us.user_id = $1
        ORDER BY us.start_date DESC
    `;
    const result = await pool.query(query, [userId]);
    return result.rows;
};

const subscribe = async (userId, planId) => {
    await pool.query(
        `UPDATE user_subscriptions SET status = 'cancelled' WHERE user_id = $1 AND status = 'active'`,
        [userId]
    );

    const endDate = new Date();
    endDate.setMonth(endDate.getMonth() + 1);

    const query = `
        INSERT INTO user_subscriptions (user_id, plan_id, start_date, end_date, status)
        VALUES ($1, $2, NOW(), $3, 'active')
        RETURNING id, user_id, plan_id, start_date, end_date, status
    `;
    const result = await pool.query(query, [userId, planId, endDate]);
    return result.rows[0];
};

const cancelSubscription = async (subscriptionId, userId) => {
    const query = `
        UPDATE user_subscriptions
        SET status = 'cancelled'
        WHERE id = $1 AND user_id = $2
        RETURNING id, user_id, plan_id, status
    `;
    const result = await pool.query(query, [subscriptionId, userId]);
    return result.rows[0] || null;
};

module.exports = {
    getAllPlans,
    getPlanById,
    getActiveSubscription,
    getUserSubscriptions,
    subscribe,
    cancelSubscription
};
