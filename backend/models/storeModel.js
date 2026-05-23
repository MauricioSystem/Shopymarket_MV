const pool = require('../src/db/database');

const createStore = async (storeData) => {
    const {
        admin_user_id,
        name,
        description,
        background_color,
        logo_url,
        banner_url,
        country,
        city,
        address,
        status = 'active',
    } = storeData;

    const query = `
        INSERT INTO stores (
            admin_user_id,
            name,
            description,
            background_color,
            logo_url,
            banner_url,
            country,
            city,
            address,
            status
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        RETURNING *
    `;

    const values = [
        admin_user_id,
        name,
        description || null,
        background_color || null,
        logo_url || null,
        banner_url || null,
        country || null,
        city || null,
        address || null,
        status,
    ];

    const result = await pool.query(query, values);
    return result.rows[0];
};

const getAllStores = async () => {
    const query = `
        SELECT *
        FROM stores
        ORDER BY created_at DESC
    `;
    const result = await pool.query(query);
    return result.rows;
};

const getStoreById = async (storeId) => {
    const query = `
        SELECT *
        FROM stores
        WHERE id = $1
    `;
    const result = await pool.query(query, [storeId]);
    return result.rows[0] || null;
};

const updateStore = async (storeId, storeData) => {
    const {
        name,
        description,
        background_color,
        logo_url,
        banner_url,
        country,
        city,
        address,
        status,
    } = storeData;

    const setClause = [];
    const values = [];
    let index = 1;

    if (name !== undefined) {
        setClause.push(`name = $${index++}`);
        values.push(name);
    }
    if (description !== undefined) {
        setClause.push(`description = $${index++}`);
        values.push(description);
    }
    if (background_color !== undefined) {
        setClause.push(`background_color = $${index++}`);
        values.push(background_color);
    }
    if (logo_url !== undefined) {
        setClause.push(`logo_url = $${index++}`);
        values.push(logo_url);
    }
    if (banner_url !== undefined) {
        setClause.push(`banner_url = $${index++}`);
        values.push(banner_url);
    }
    if (country !== undefined) {
        setClause.push(`country = $${index++}`);
        values.push(country);
    }
    if (city !== undefined) {
        setClause.push(`city = $${index++}`);
        values.push(city);
    }
    if (address !== undefined) {
        setClause.push(`address = $${index++}`);
        values.push(address);
    }
    if (status !== undefined) {
        setClause.push(`status = $${index++}`);
        values.push(status);
    }

    if (setClause.length === 0) {
        return null;
    }

    values.push(storeId);
    const query = `
        UPDATE stores
        SET ${setClause.join(', ')}
        WHERE id = $${index}
        RETURNING *
    `;

    const result = await pool.query(query, values);
    return result.rows[0] || null;
};

const deleteStore = async (storeId) => {
    const query = `
        UPDATE stores
        SET status = 'inactive'
        WHERE id = $1
        RETURNING *
    `;
    const result = await pool.query(query, [storeId]);
    return result.rows[0] || null;
};

const getStoreByUserId = async (userId) => {
    const query = `
        SELECT *
        FROM stores
        WHERE admin_user_id = $1
        LIMIT 1
    `;
    const result = await pool.query(query, [userId]);
    return result.rows[0] || null;
};

const getStoreWithProducts = async (storeId) => {
    const query = `
        SELECT 
            s.*,
            COUNT(p.id) as product_count
        FROM stores s
        LEFT JOIN products p ON s.id = p.store_id
        WHERE s.id = $1
        GROUP BY s.id
    `;
    const result = await pool.query(query, [storeId]);
    return result.rows[0] || null;
};

module.exports = {
    createStore,
    getAllStores,
    getStoreById,
    getStoreByUserId,
    getStoreWithProducts,
    updateStore,
    deleteStore,
};
