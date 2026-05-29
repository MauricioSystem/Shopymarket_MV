const pool = require('../src/db/database');

const getActiveCartByUserId = async (userId) => {
    const query = `
        SELECT id, customer_user_id, status, created_at
        FROM carts
        WHERE customer_user_id = $1 AND status = 'active'
    `;
    const result = await pool.query(query, [userId]);
    return result.rows[0] || null;
};

const createCart = async (userId) => {
    const query = `
        INSERT INTO carts (customer_user_id, status)
        VALUES ($1, 'active')
        RETURNING id, customer_user_id, status, created_at
    `;
    const result = await pool.query(query, [userId]);
    return result.rows[0];
};

const getCartItems = async (cartId) => {
    const query = `
        SELECT ci.id, ci.cart_id, ci.product_id, ci.quantity, ci.unit_price, ci.subtotal,
               p.name AS product_name, p.image_url AS product_image, p.stock AS product_stock, p.store_id
        FROM cart_items ci
        JOIN products p ON ci.product_id = p.id
        WHERE ci.cart_id = $1
    `;
    const result = await pool.query(query, [cartId]);
    return result.rows;
};

const getCartItemByProduct = async (cartId, productId) => {
    const query = `
        SELECT id, cart_id, product_id, quantity, unit_price, subtotal
        FROM cart_items
        WHERE cart_id = $1 AND product_id = $2
    `;
    const result = await pool.query(query, [cartId, productId]);
    return result.rows[0] || null;
};

const addCartItem = async (cartId, productId, quantity, price) => {
    const subtotal = quantity * price;
    const query = `
        INSERT INTO cart_items (cart_id, product_id, quantity, unit_price, subtotal)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING id, cart_id, product_id, quantity, unit_price, subtotal
    `;
    const result = await pool.query(query, [cartId, productId, quantity, price, subtotal]);
    return result.rows[0];
};

const updateCartItemQuantity = async (itemId, quantity, subtotal) => {
    const query = `
        UPDATE cart_items
        SET quantity = $1, subtotal = $2
        WHERE id = $3
        RETURNING id, cart_id, product_id, quantity, unit_price, subtotal
    `;
    const result = await pool.query(query, [quantity, subtotal, itemId]);
    return result.rows[0];
};

const deleteCartItem = async (cartId, productId) => {
    const query = `
        DELETE FROM cart_items
        WHERE cart_id = $1 AND product_id = $2
        RETURNING id
    `;
    const result = await pool.query(query, [cartId, productId]);
    return result.rows[0] || null;
};

const clearCartItems = async (cartId) => {
    const query = `
        DELETE FROM cart_items
        WHERE cart_id = $1
    `;
    await pool.query(query, [cartId]);
};

const updateCartStatus = async (cartId, status) => {
    const query = `
        UPDATE carts
        SET status = $1
        WHERE id = $2
        RETURNING id, customer_user_id, status
    `;
    const result = await pool.query(query, [status, cartId]);
    return result.rows[0];
};

module.exports = {
    getActiveCartByUserId,
    createCart,
    getCartItems,
    getCartItemByProduct,
    addCartItem,
    updateCartItemQuantity,
    deleteCartItem,
    clearCartItems,
    updateCartStatus
};
