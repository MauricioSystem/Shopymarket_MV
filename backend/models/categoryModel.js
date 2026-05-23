const pool = require('../src/db/database');

const createCategory = async (categoryData) => {
    const { name, type = 'general', status = 'active' } = categoryData;

    const query = `
        INSERT INTO categories (name, type, status)
        VALUES ($1, $2, $3)
        RETURNING *
    `;

    const values = [name, type, status];
    const result = await pool.query(query, values);
    return result.rows[0];
};

const getAllCategories = async () => {
    const query = `
        SELECT *
        FROM categories
        ORDER BY name
    `;
    const result = await pool.query(query);
    return result.rows;
};

const getCategoryById = async (categoryId) => {
    const query = `
        SELECT *
        FROM categories
        WHERE id = $1
    `;
    const result = await pool.query(query, [categoryId]);
    return result.rows[0] || null;
};

const updateCategory = async (categoryId, categoryData) => {
    const { name, type, status } = categoryData;
    const setClause = [];
    const values = [];
    let index = 1;

    if (name !== undefined) {
        setClause.push(`name = $${index++}`);
        values.push(name);
    }
    if (type !== undefined) {
        setClause.push(`type = $${index++}`);
        values.push(type);
    }
    if (status !== undefined) {
        setClause.push(`status = $${index++}`);
        values.push(status);
    }

    if (setClause.length === 0) {
        return null;
    }

    values.push(categoryId);
    const query = `
        UPDATE categories
        SET ${setClause.join(', ')}
        WHERE id = $${index}
        RETURNING *
    `;

    const result = await pool.query(query, values);
    return result.rows[0] || null;
};

const deleteCategory = async (categoryId) => {
    const query = `
        UPDATE categories
        SET status = 'inactive'
        WHERE id = $1
        RETURNING *
    `;
    const result = await pool.query(query, [categoryId]);
    return result.rows[0] || null;
};

module.exports = {
    createCategory,
    getAllCategories,
    getCategoryById,
    updateCategory,
    deleteCategory,
};
