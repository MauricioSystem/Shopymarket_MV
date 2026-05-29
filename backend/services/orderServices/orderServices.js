const orderModel = require('../../models/orderModel');
const cartModel = require('../../models/cartModel');

const placeOrderFromCart = async (userId, orderInfo) => {
    try {
        const { order_type, delivery_address, shipping_cost = 0, discount = 0 } = orderInfo;

        if (!order_type) {
            throw new Error('Order type is required');
        }

        if (order_type === 'delivery' && !delivery_address) {
            throw new Error('Delivery address is required for delivery order type');
        }

        const cart = await cartModel.getActiveCartByUserId(userId);
        if (!cart) {
            throw new Error('No active cart found');
        }

        const items = await cartModel.getCartItems(cart.id);
        if (!items || items.length === 0) {
            throw new Error('Cart is empty');
        }

        const storeId = items[0].store_id;
        
        let subtotal = 0;
        const formattedItems = items.map(item => {
            const price = parseFloat(item.unit_price);
            const qty = parseInt(item.quantity, 10);
            const itemSubtotal = price * qty;
            subtotal += itemSubtotal;

            return {
                product_id: item.product_id,
                quantity: qty,
                unit_price: price,
                subtotal: itemSubtotal
            };
        });

        const shipCost = parseFloat(shipping_cost);
        const disc = parseFloat(discount);
        const total = subtotal + shipCost - disc;

        const orderData = {
            customer_user_id: userId,
            store_id: storeId,
            order_type,
            subtotal,
            discount: disc,
            shipping_cost: shipCost,
            total: total > 0 ? total : 0,
            delivery_address,
            cart_id: cart.id,
            items: formattedItems
        };

        const order = await orderModel.createOrderInTransaction(orderData);

        return {
            success: true,
            data: order,
            message: 'Order created successfully'
        };
    } catch (error) {
        throw {
            success: false,
            message: 'Error placing order',
            error: error.message
        };
    }
};

const getOrderDetails = async (orderId, userId, userRole) => {
    try {
        const order = await orderModel.getOrderById(orderId);
        if (!order) {
            throw new Error('Order not found');
        }

        if (userRole === 'cliente' && parseInt(order.customer_user_id, 10) !== parseInt(userId, 10)) {
            throw new Error('Unauthorized access to this order');
        }

        const items = await orderModel.getOrderDetails(orderId);

        return {
            success: true,
            data: {
                ...order,
                items
            },
            message: 'Order details retrieved successfully'
        };
    } catch (error) {
        throw {
            success: false,
            message: 'Error retrieving order details',
            error: error.message
        };
    }
};

const getCustomerOrders = async (customerId) => {
    try {
        const orders = await orderModel.getOrdersByCustomerId(customerId);
        return {
            success: true,
            data: orders,
            message: 'Customer orders retrieved successfully'
        };
    } catch (error) {
        throw {
            success: false,
            message: 'Error retrieving customer orders',
            error: error.message
        };
    }
};

const getStoreOrders = async (storeId) => {
    try {
        const orders = await orderModel.getOrdersByStoreId(storeId);
        return {
            success: true,
            data: orders,
            message: 'Store orders retrieved successfully'
        };
    } catch (error) {
        throw {
            success: false,
            message: 'Error retrieving store orders',
            error: error.message
        };
    }
};

const getAllOrders = async () => {
    try {
        const orders = await orderModel.getAllOrders();
        return {
            success: true,
            data: orders,
            message: 'All orders retrieved successfully'
        };
    } catch (error) {
        throw {
            success: false,
            message: 'Error retrieving all orders',
            error: error.message
        };
    }
};

const changeOrderStatus = async (orderId, status, userId, userRole) => {
    try {
        const order = await orderModel.getOrderById(orderId);
        if (!order) {
            throw new Error('Order not found');
        }

        if (userRole === 'repartidor') {
            const allowedRepartidorStatuses = ['picked_up', 'delivered', 'cancelled'];
            if (!allowedRepartidorStatuses.includes(status)) {
                throw new Error('Status transition not allowed for repartidor');
            }
        }

        const updatedOrder = await orderModel.updateOrderStatus(orderId, status);
        return {
            success: true,
            data: updatedOrder,
            message: 'Order status updated successfully'
        };
    } catch (error) {
        throw {
            success: false,
            message: 'Error updating order status',
            error: error.message
        };
    }
};

module.exports = {
    placeOrderFromCart,
    getOrderDetails,
    getCustomerOrders,
    getStoreOrders,
    getAllOrders,
    changeOrderStatus
};
