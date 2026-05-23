const pool = require('../src/db/database');

const createRating = async (ratingData) => {
    const { product_id, user_id, score, comment } = ratingData;

    const query = `
        INSERT INTO product_ratings (product_id, user_id, score, comment, created_at)
        VALUES ($1, $2, $3, $4, NOW())
        RETURNING *
    `;

    const values = [product_id, user_id, score, comment || null];
    const result = await pool.query(query, values);
    return result.rows[0];
};

const getRatingsByProductId = async (productId) => {
    const query = `
        SELECT pr.*, u.first_name, u.last_name, u.profile_image_url
        FROM product_ratings pr
        JOIN users u ON pr.user_id = u.id
        WHERE pr.product_id = $1
        ORDER BY pr.created_at DESC
    `;

    const result = await pool.query(query, [productId]);
    return result.rows;
};

const getProductAverageRating = async (productId) => {
    const query = `
        SELECT 
            COUNT(*) as total_ratings,
            AVG(score) as average_score,
            MAX(score) as max_score,
            MIN(score) as min_score
        FROM product_ratings
        WHERE product_id = $1
    `;

    const result = await pool.query(query, [productId]);
    return result.rows[0];
};

const checkUserRating = async (productId, userId) => {
    const query = `
        SELECT * FROM product_ratings
        WHERE product_id = $1 AND user_id = $2
        LIMIT 1
    `;

    const result = await pool.query(query, [productId, userId]);
    return result.rows[0] || null;
};

const updateRating = async (ratingId, ratingData) => {
    const { score, comment } = ratingData;

    const query = `
        UPDATE product_ratings
        SET score = $1, comment = $2, updated_at = NOW()
        WHERE id = $3
        RETURNING *
    `;

    const values = [score, comment || null, ratingId];
    const result = await pool.query(query, values);
    return result.rows[0];
};

const deleteRating = async (ratingId) => {
    const query = `
        DELETE FROM product_ratings
        WHERE id = $1
        RETURNING *
    `;

    const result = await pool.query(query, [ratingId]);
    return result.rows[0];
};

module.exports = {
    createRating,
    getRatingsByProductId,
    getProductAverageRating,
    checkUserRating,
    updateRating,
    deleteRating,
};
