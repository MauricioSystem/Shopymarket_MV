const pool = require('../src/db/database');

const createServiceProfile = async (profileData) => {
    const {
        admin_user_id,
        store_id,
        name,
        description,
        background_color,
        profile_image_url,
        banner_url,
        country,
        city,
        address,
        status = 'active',
    } = profileData;

    const query = `
        INSERT INTO service_profiles (
            admin_user_id,
            store_id,
            name,
            description,
            background_color,
            profile_image_url,
            banner_url,
            country,
            city,
            address,
            status
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
        RETURNING *
    `;

    const values = [
        admin_user_id,
        store_id || null,
        name,
        description || null,
        background_color || null,
        profile_image_url || null,
        banner_url || null,
        country || null,
        city || null,
        address || null,
        status,
    ];

    const result = await pool.query(query, values);
    return result.rows[0];
};

const getAllServiceProfiles = async () => {
    const query = `
        SELECT *
        FROM service_profiles
        ORDER BY created_at DESC
    `;
    const result = await pool.query(query);
    return result.rows;
};

const getServiceProfileById = async (profileId) => {
    const query = `
        SELECT *
        FROM service_profiles
        WHERE id = $1
    `;
    const result = await pool.query(query, [profileId]);
    return result.rows[0] || null;
};

const updateServiceProfile = async (profileId, profileData) => {
    const {
        store_id,
        name,
        description,
        background_color,
        profile_image_url,
        banner_url,
        country,
        city,
        address,
        status,
    } = profileData;

    const setClause = [];
    const values = [];
    let index = 1;

    if (store_id !== undefined) {
        setClause.push(`store_id = $${index++}`);
        values.push(store_id);
    }
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
    if (profile_image_url !== undefined) {
        setClause.push(`profile_image_url = $${index++}`);
        values.push(profile_image_url);
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

    values.push(profileId);
    const query = `
        UPDATE service_profiles
        SET ${setClause.join(', ')}
        WHERE id = $${index}
        RETURNING *
    `;

    const result = await pool.query(query, values);
    return result.rows[0] || null;
};

const deleteServiceProfile = async (profileId) => {
    const query = `
        UPDATE service_profiles
        SET status = 'inactive'
        WHERE id = $1
        RETURNING *
    `;
    const result = await pool.query(query, [profileId]);
    return result.rows[0] || null;
};

module.exports = {
    createServiceProfile,
    getAllServiceProfiles,
    getServiceProfileById,
    updateServiceProfile,
    deleteServiceProfile,
};
