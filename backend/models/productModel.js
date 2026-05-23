const pool = require('../src/db/database');

const createProduct = async (productData) => {
    const {
        store_id,
        category_id,
        subcategory_id,
        name,
        description,
        price,
        stock = 0,
        image_url,
        status = 'active',
    } = productData;

    const query = `
        INSERT INTO products (
            store_id,
            category_id,
            subcategory_id,
            name,
            description,
            price,
            stock,
            image_url,
            status
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        RETURNING *
    `;

    const values = [
        store_id,
        category_id,
        subcategory_id || null,
        name,
        description || null,
        price,
        stock,
        image_url || null,
        status,
    ];

    const result = await pool.query(query, values);
    return result.rows[0];
};

const getAllProducts = async () => {
    const query = `
        SELECT *
        FROM products
        ORDER BY created_at DESC
    `;
    const result = await pool.query(query);
    return result.rows;
};

const getProductById = async (productId) => {
    const query = `
        SELECT *
        FROM products
        WHERE id = $1
    `;
    const result = await pool.query(query, [productId]);
    return result.rows[0] || null;
};

const getProductsByStore = async (storeId) => {
    const query = `
        SELECT *
        FROM products
        WHERE store_id = $1
        ORDER BY created_at DESC
    `;
    const result = await pool.query(query, [storeId]);
    return result.rows;
};

const getProductsByCategory = async (categoryId) => {
    const query = `
        SELECT *
        FROM products
        WHERE category_id = $1
        ORDER BY created_at DESC
    `;
    const result = await pool.query(query, [categoryId]);
    return result.rows;
};

const updateProduct = async (productId, productData) => {
    const {
        store_id,
        category_id,
        subcategory_id,
        name,
        description,
        price,
        stock,
        image_url,
        status,
        is_featured,
    } = productData;

    const setClause = [];
    const values = [];
    let index = 1;

    if (store_id !== undefined) {
        setClause.push(`store_id = $${index++}`);
        values.push(store_id);
    }
    if (category_id !== undefined) {
        setClause.push(`category_id = $${index++}`);
        values.push(category_id);
    }
    if (subcategory_id !== undefined) {
        setClause.push(`subcategory_id = $${index++}`);
        values.push(subcategory_id);
    }
    if (name !== undefined) {
        setClause.push(`name = $${index++}`);
        values.push(name);
    }
    if (description !== undefined) {
        setClause.push(`description = $${index++}`);
        values.push(description);
    }
    if (price !== undefined) {
        setClause.push(`price = $${index++}`);
        values.push(price);
    }
    if (stock !== undefined) {
        setClause.push(`stock = $${index++}`);
        values.push(stock);
    }
    if (image_url !== undefined) {
        setClause.push(`image_url = $${index++}`);
        values.push(image_url);
    }
    if (status !== undefined) {
        setClause.push(`status = $${index++}`);
        values.push(status);
    }
    if (is_featured !== undefined) {
        setClause.push(`is_featured = $${index++}`);
        values.push(is_featured);
    }

    if (setClause.length === 0) {
        return null;
    }

    values.push(productId);
    const query = `
        UPDATE products
        SET ${setClause.join(', ')}
        WHERE id = $${index}
        RETURNING *
    `;

    const result = await pool.query(query, values);
    return result.rows[0] || null;
};

const deleteProduct = async (productId) => {
    const query = `
        UPDATE products
        SET status = 'inactive'
        WHERE id = $1
        RETURNING *
    `;
    const result = await pool.query(query, [productId]);
    return result.rows[0] || null;
};

module.exports = {
    createProduct,
    getAllProducts,
    getProductById,
    getProductsByStore,
    getProductsByCategory,
    updateProduct,
    deleteProduct,
};
