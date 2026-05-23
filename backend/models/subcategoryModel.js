const pool = require('../src/db/database');

const createSubcategory = async (subcategoryData) => {
    const { category_id, store_id = null, name, status = 'active' } = subcategoryData;

    const query = `
        INSERT INTO subcategories (category_id, store_id, name, status)
        VALUES ($1, $2, $3, $4)
        RETURNING *
    `;

    const values = [category_id, store_id, name, status];
    const result = await pool.query(query, values);
    return result.rows[0];
};

const getAllSubcategories = async () => {
    const query = `
        SELECT *
        FROM subcategories
        ORDER BY name
    `;
    const result = await pool.query(query);
    return result.rows;
};

const getSubcategoryById = async (subcategoryId) => {
    const query = `
        SELECT *
        FROM subcategories
        WHERE id = $1
    `;
    const result = await pool.query(query, [subcategoryId]);
    return result.rows[0] || null;
};

const getSubcategoriesByCategory = async (categoryId) => {
    const query = `
        SELECT *
        FROM subcategories
        WHERE category_id = $1
        ORDER BY name
    `;
    const result = await pool.query(query, [categoryId]);
    return result.rows;
};

const updateSubcategory = async (subcategoryId, subcategoryData) => {
    const { category_id, store_id, name, status } = subcategoryData;
    const setClause = [];
    const values = [];
    let index = 1;

    if (category_id !== undefined) {
        setClause.push(`category_id = $${index++}`);
        values.push(category_id);
    }
    if (store_id !== undefined) {
        setClause.push(`store_id = $${index++}`);
        values.push(store_id);
    }
    if (name !== undefined) {
        setClause.push(`name = $${index++}`);
        values.push(name);
    }
    if (status !== undefined) {
        setClause.push(`status = $${index++}`);
        values.push(status);
    }

    if (setClause.length === 0) {
        return null;
    }

    values.push(subcategoryId);
    const query = `
        UPDATE subcategories
        SET ${setClause.join(', ')}
        WHERE id = $${index}
        RETURNING *
    `;

    const result = await pool.query(query, values);
    return result.rows[0] || null;
};

const deleteSubcategory = async (subcategoryId) => {
    const query = `
        UPDATE subcategories
        SET status = 'inactive'
        WHERE id = $1
        RETURNING *
    `;
    const result = await pool.query(query, [subcategoryId]);
    return result.rows[0] || null;
};

module.exports = {
    createSubcategory,
    getAllSubcategories,
    getSubcategoryById,
    getSubcategoriesByCategory,
    updateSubcategory,
    deleteSubcategory,
};
