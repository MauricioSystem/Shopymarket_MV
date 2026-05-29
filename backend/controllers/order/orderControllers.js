const orderServices = require('../../services/orderServices/orderServices');

const createOrder = async (req, res) => {
    try {
        const result = await orderServices.placeOrderFromCart(req.user.id, req.body);
        return res.status(201).json(result);
    } catch (error) {
        return res.status(400).json(error);
    }
};

const getOrderById = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await orderServices.getOrderDetails(id, req.user.id, req.user.role);
        return res.status(200).json(result);
    } catch (error) {
        const status = error.message === 'Unauthorized access to this order' ? 403 : 404;
        return res.status(status).json(error);
    }
};

const getMyOrders = async (req, res) => {
    try {
        const result = await orderServices.getCustomerOrders(req.user.id);
        return res.status(200).json(result);
    } catch (error) {
        return res.status(500).json(error);
    }
};

const getStoreOrders = async (req, res) => {
    try {
        const { storeId } = req.params;
        const result = await orderServices.getStoreOrders(storeId);
        return res.status(200).json(result);
    } catch (error) {
        return res.status(500).json(error);
    }
};

const getAllOrders = async (req, res) => {
    try {
        const result = await orderServices.getAllOrders();
        return res.status(200).json(result);
    } catch (error) {
        return res.status(500).json(error);
    }
};

const updateStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        const result = await orderServices.changeOrderStatus(id, status, req.user.id, req.user.role);
        return res.status(200).json(result);
    } catch (error) {
        return res.status(400).json(error);
    }
};

module.exports = {
    createOrder,
    getOrderById,
    getMyOrders,
    getStoreOrders,
    getAllOrders,
    updateStatus
};
