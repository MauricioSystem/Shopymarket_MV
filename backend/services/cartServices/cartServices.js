const cartModel = require('../../models/cartModel');
const productModel = require('../../models/productModel');

const getOrCreateActiveCart = async (userId) => {
    let cart = await cartModel.getActiveCartByUserId(userId);
    if (!cart) {
        cart = await cartModel.createCart(userId);
    }
    return cart;
};

const getCartDetails = async (userId) => {
    try {
        const cart = await getOrCreateActiveCart(userId);
        const items = await cartModel.getCartItems(cart.id);
        
        let total = 0;
        items.forEach(item => {
            total += parseFloat(item.subtotal);
        });

        return {
            success: true,
            data: {
                cart_id: cart.id,
                customer_user_id: cart.customer_user_id,
                status: cart.status,
                items,
                total
            },
            message: 'Cart retrieved successfully'
        };
    } catch (error) {
        throw {
            success: false,
            message: 'Error retrieving cart',
            error: error.message
        };
    }
};

const addItemToCart = async (userId, productId, quantity) => {
    try {
        if (!productId || quantity <= 0) {
            throw new Error('Invalid product_id or quantity');
        }

        const product = await productModel.getProductById(productId);
        if (!product) {
            throw new Error('Product not found');
        }

        if (product.status !== 'active') {
            throw new Error('Product is not active');
        }

        const cart = await getOrCreateActiveCart(userId);
        const existingItem = await cartModel.getCartItemByProduct(cart.id, productId);

        const newQuantity = existingItem ? (existingItem.quantity + quantity) : quantity;

        if (product.stock < newQuantity) {
            throw new Error(`Insufficient stock. Available: ${product.stock}`);
        }

        let item;
        const unitPrice = parseFloat(product.price);
        if (existingItem) {
            const subtotal = newQuantity * unitPrice;
            item = await cartModel.updateCartItemQuantity(existingItem.id, newQuantity, subtotal);
        } else {
            item = await cartModel.addCartItem(cart.id, productId, quantity, unitPrice);
        }

        return {
            success: true,
            data: item,
            message: 'Item added to cart successfully'
        };
    } catch (error) {
        throw {
            success: false,
            message: 'Error adding item to cart',
            error: error.message
        };
    }
};

const updateItemQuantity = async (userId, productId, quantity) => {
    try {
        if (!productId) {
            throw new Error('Product ID is required');
        }

        const cart = await cartModel.getActiveCartByUserId(userId);
        if (!cart) {
            throw new Error('No active cart found');
        }

        if (quantity <= 0) {
            const deleted = await cartModel.deleteCartItem(cart.id, productId);
            return {
                success: true,
                data: deleted,
                message: 'Item removed from cart because quantity was zero or negative'
            };
        }

        const product = await productModel.getProductById(productId);
        if (!product) {
            throw new Error('Product not found');
        }

        if (product.stock < quantity) {
            throw new Error(`Insufficient stock. Available: ${product.stock}`);
        }

        const existingItem = await cartModel.getCartItemByProduct(cart.id, productId);
        if (!existingItem) {
            throw new Error('Item not found in cart');
        }

        const unitPrice = parseFloat(product.price);
        const subtotal = quantity * unitPrice;
        const item = await cartModel.updateCartItemQuantity(existingItem.id, quantity, subtotal);

        return {
            success: true,
            data: item,
            message: 'Cart item quantity updated successfully'
        };
    } catch (error) {
        throw {
            success: false,
            message: 'Error updating cart item',
            error: error.message
        };
    }
};

const removeItemFromCart = async (userId, productId) => {
    try {
        if (!productId) {
            throw new Error('Product ID is required');
        }

        const cart = await cartModel.getActiveCartByUserId(userId);
        if (!cart) {
            throw new Error('No active cart found');
        }

        const deleted = await cartModel.deleteCartItem(cart.id, productId);
        if (!deleted) {
            throw new Error('Item not found in cart');
        }

        return {
            success: true,
            data: deleted,
            message: 'Item removed from cart successfully'
        };
    } catch (error) {
        throw {
            success: false,
            message: 'Error removing item from cart',
            error: error.message
        };
    }
};

const clearCart = async (userId) => {
    try {
        const cart = await cartModel.getActiveCartByUserId(userId);
        if (!cart) {
            throw new Error('No active cart found');
        }

        await cartModel.clearCartItems(cart.id);

        return {
            success: true,
            message: 'Cart cleared successfully'
        };
    } catch (error) {
        throw {
            success: false,
            message: 'Error clearing cart',
            error: error.message
        };
    }
};

module.exports = {
    getOrCreateActiveCart,
    getCartDetails,
    addItemToCart,
    updateItemQuantity,
    removeItemFromCart,
    clearCart
};
