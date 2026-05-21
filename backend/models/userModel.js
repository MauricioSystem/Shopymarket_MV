const pool = require('../src/db/database');

const getAllUsers = async () => {
    const query = `
        SELECT id, first_name, last_name, email, phone, profile_image_url, 
               country, city, address, status, created_at
        FROM users
        ORDER BY created_at DESC
    `;
    const result = await pool.query(query);
    return result.rows;
};

const getAllUsersWithRoles = async () => {
    const query = `
        SELECT
            u.id,
            u.first_name,
            u.last_name,
            u.email,
            u.phone,
            u.profile_image_url,
            u.country,
            u.city,
            u.address,
            u.status,
            u.created_at,
            COALESCE(
                json_agg(
                    json_build_object('id', r.id, 'name', r.name)
                ) FILTER (WHERE r.id IS NOT NULL),
                '[]'::json
            ) AS roles
        FROM users u
        LEFT JOIN user_roles ur ON u.id = ur.user_id
        LEFT JOIN roles r      ON ur.role_id = r.id
        GROUP BY u.id
        ORDER BY u.created_at DESC
    `;
    const result = await pool.query(query);
    return result.rows;
};

const getUserById = async (userId) => {
    const query = `
        SELECT id, first_name, last_name, email, phone, profile_image_url, 
               country, city, address, status, created_at
        FROM users
        WHERE id = $1
    `;
    const result = await pool.query(query, [userId]);
    return result.rows[0] || null;
};

const getUserByEmail = async (email) => {
    const query = `
        SELECT id, first_name, last_name, email, phone, profile_image_url, 
               country, city, address, status, created_at, password_hash
        FROM users
        WHERE email = $1
    `;
    const result = await pool.query(query, [email]);
    return result.rows[0] || null;
};

const createUser = async (userData) => {
    const { first_name, last_name, email, password_hash, phone, country, city, address } = userData;
    const query = `
        INSERT INTO users (first_name, last_name, email, password_hash, phone, country, city, address, status)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'active')
        RETURNING id, first_name, last_name, email, phone, profile_image_url, 
                  country, city, address, status, created_at
    `;
    const values = [first_name, last_name, email, password_hash, phone, country, city, address];
    const result = await pool.query(query, values);
    return result.rows[0];
};

const updateUser = async (userId, userData) => {
    const { first_name, last_name, phone, profile_image_url, country, city, address } = userData;
    const query = `
        UPDATE users
        SET first_name = $1, last_name = $2, phone = $3, profile_image_url = $4, 
            country = $5, city = $6, address = $7
        WHERE id = $8
        RETURNING id, first_name, last_name, email, phone, profile_image_url, 
                  country, city, address, status, created_at
    `;
    const values = [first_name, last_name, phone, profile_image_url, country, city, address, userId];
    const result = await pool.query(query, values);
    return result.rows[0] || null;
};

const deleteUser = async (userId) => {
    const query = `
        UPDATE users
        SET status = 'deleted'
        WHERE id = $1
        RETURNING id, first_name, last_name, email, status
    `;
    const result = await pool.query(query, [userId]);
    return result.rows[0] || null;
};

const getUserRoles = async (userId) => {
    const query = `
        SELECT r.id, r.name, r.description
        FROM user_roles ur
        JOIN roles r ON ur.role_id = r.id
        WHERE ur.user_id = $1
    `;
    const result = await pool.query(query, [userId]);
    return result.rows;
};

const assignRoleToUser = async (userId, roleId) => {
    const query = `
        INSERT INTO user_roles (user_id, role_id)
        VALUES ($1, $2)
        ON CONFLICT DO NOTHING
    `;
    await pool.query(query, [userId, roleId]);
};

module.exports = {
    getAllUsers,
    getAllUsersWithRoles,
    getUserById,
    getUserByEmail,
    createUser,
    updateUser,
    deleteUser,
    getUserRoles,
    assignRoleToUser
};
