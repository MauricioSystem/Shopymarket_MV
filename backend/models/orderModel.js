const pool = require('../src/db/database');

const createOrderInTransaction = async (orderData) => {
    const {
        customer_user_id,
        store_id,
        order_type,
        subtotal,
        discount,
        shipping_cost,
        total,
        delivery_address,
        cart_id,
        items
    } = orderData;

    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        for (const item of items) {
            const productResult = await client.query(
                'SELECT stock, name FROM products WHERE id = $1 FOR UPDATE',
                [item.product_id]
            );
            const product = productResult.rows[0];

            if (!product) {
                throw new Error(`Product not found`);
            }

            if (product.stock < item.quantity) {
                throw new Error(`Insufficient stock for product ${product.name}`);
            }

            await client.query(
                'UPDATE products SET stock = stock - $1, sales_count = sales_count + $1 WHERE id = $2',
                [item.quantity, item.product_id]
            );
        }

        const orderQuery = `
            INSERT INTO orders (customer_user_id, store_id, order_type, status, subtotal, discount, shipping_cost, total, delivery_address)
            VALUES ($1, $2, $3, 'pending', $4, $5, $6, $7, $8)
            RETURNING id, customer_user_id, store_id, order_type, status, subtotal, discount, shipping_cost, total, delivery_address, created_at
        `;
        const orderValues = [
            customer_user_id,
            store_id || null,
            order_type,
            subtotal,
            discount || 0,
            shipping_cost || 0,
            total,
            delivery_address || null
        ];
        const orderResult = await client.query(orderQuery, orderValues);
        const order = orderResult.rows[0];

        for (const item of items) {
            const detailQuery = `
                INSERT INTO order_details (order_id, product_id, quantity, unit_price, subtotal)
                VALUES ($1, $2, $3, $4, $5)
            `;
            await client.query(detailQuery, [
                order.id,
                item.product_id,
                item.quantity,
                item.unit_price,
                item.subtotal
            ]);
        }

        await client.query("UPDATE carts SET status = 'completed' WHERE id = $1", [cart_id]);

        await client.query('COMMIT');
        return order;
    } catch (error) {
        await client.query('ROLLBACK');
        throw error;
    } finally {
        client.release();
    }
};

const getOrderById = async (orderId) => {
    const query = `
        SELECT id, customer_user_id, store_id, delivery_user_id, order_type, status, 
               subtotal, discount, shipping_cost, total, delivery_address, created_at
        FROM orders
        WHERE id = $1
    `;
    const result = await pool.query(query, [orderId]);
    return result.rows[0] || null;
};

const getOrderDetails = async (orderId) => {
    const query = `
        SELECT od.id, od.order_id, od.product_id, od.service_id, od.quantity, od.unit_price, od.subtotal,
               p.name AS product_name, p.image_url AS product_image,
               s.name AS service_name, s.image_url AS service_image
        FROM order_details od
        LEFT JOIN products p ON od.product_id = p.id
        LEFT JOIN services s ON od.service_id = s.id
        WHERE od.order_id = $1
    `;
    const result = await pool.query(query, [orderId]);
    return result.rows;
};

const getOrdersByCustomerId = async (customerId) => {
    const query = `
        SELECT id, customer_user_id, store_id, delivery_user_id, order_type, status, 
               subtotal, discount, shipping_cost, total, delivery_address, created_at
        FROM orders
        WHERE customer_user_id = $1
        ORDER BY created_at DESC
    `;
    const result = await pool.query(query, [customerId]);
    return result.rows;
};

const getOrdersByStoreId = async (storeId) => {
    const query = `
        SELECT id, customer_user_id, store_id, delivery_user_id, order_type, status, 
               subtotal, discount, shipping_cost, total, delivery_address, created_at
        FROM orders
        WHERE store_id = $1
        ORDER BY created_at DESC
    `;
    const result = await pool.query(query, [storeId]);
    return result.rows;
};

const getAllOrders = async () => {
    const query = `
        SELECT id, customer_user_id, store_id, delivery_user_id, order_type, status, 
               subtotal, discount, shipping_cost, total, delivery_address, created_at
        FROM orders
        ORDER BY created_at DESC
    `;
    const result = await pool.query(query);
    return result.rows;
};

const updateOrderStatus = async (orderId, status) => {
    const query = `
        UPDATE orders
        SET status = $1
        WHERE id = $2
        RETURNING id, customer_user_id, store_id, delivery_user_id, order_type, status, total
    `;
    const result = await pool.query(query, [status, orderId]);
    return result.rows[0] || null;
};

const assignDeliveryUser = async (orderId, deliveryUserId) => {
    const query = `
        UPDATE orders
        SET delivery_user_id = $1
        WHERE id = $2
        RETURNING id, customer_user_id, store_id, delivery_user_id, order_type, status, total
    `;
    const result = await pool.query(query, [deliveryUserId, orderId]);
    return result.rows[0] || null;
};

module.exports = {
    createOrderInTransaction,
    getOrderById,
    getOrderDetails,
    getOrdersByCustomerId,
    getOrdersByStoreId,
    getAllOrders,
    updateOrderStatus,
    assignDeliveryUser
};
