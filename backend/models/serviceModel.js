const pool = require('../src/db/database');

const createService = async (serviceData) => {
    const {
        service_profile_id,
        category_id,
        name,
        description,
        price,
        estimated_time,
        image_url,
        status = 'active',
    } = serviceData;

    const query = `
        INSERT INTO services (
            service_profile_id,
            category_id,
            name,
            description,
            price,
            estimated_time,
            image_url,
            status
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        RETURNING *
    `;

    const values = [
        service_profile_id,
        category_id,
        name,
        description || null,
        price,
        estimated_time || null,
        image_url || null,
        status,
    ];

    const result = await pool.query(query, values);
    return result.rows[0];
};

const getAllServices = async () => {
    const query = `
        SELECT *
        FROM services
        ORDER BY created_at DESC
    `;
    const result = await pool.query(query);
    return result.rows;
};

const getServiceById = async (serviceId) => {
    const query = `
        SELECT *
        FROM services
        WHERE id = $1
    `;
    const result = await pool.query(query, [serviceId]);
    return result.rows[0] || null;
};

const updateService = async (serviceId, serviceData) => {
    const {
        service_profile_id,
        category_id,
        name,
        description,
        price,
        estimated_time,
        image_url,
        status,
    } = serviceData;

    const setClause = [];
    const values = [];
    let index = 1;

    if (service_profile_id !== undefined) {
        setClause.push(`service_profile_id = $${index++}`);
        values.push(service_profile_id);
    }
    if (category_id !== undefined) {
        setClause.push(`category_id = $${index++}`);
        values.push(category_id);
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
    if (estimated_time !== undefined) {
        setClause.push(`estimated_time = $${index++}`);
        values.push(estimated_time);
    }
    if (image_url !== undefined) {
        setClause.push(`image_url = $${index++}`);
        values.push(image_url);
    }
    if (status !== undefined) {
        setClause.push(`status = $${index++}`);
        values.push(status);
    }

    if (setClause.length === 0) {
        return null;
    }

    values.push(serviceId);
    const query = `
        UPDATE services
        SET ${setClause.join(', ')}
        WHERE id = $${index}
        RETURNING *
    `;

    const result = await pool.query(query, values);
    return result.rows[0] || null;
};

const deleteService = async (serviceId) => {
    const query = `
        UPDATE services
        SET status = 'inactive'
        WHERE id = $1
        RETURNING *
    `;
    const result = await pool.query(query, [serviceId]);
    return result.rows[0] || null;
};

module.exports = {
    createService,
    getAllServices,
    getServiceById,
    updateService,
    deleteService,
};
