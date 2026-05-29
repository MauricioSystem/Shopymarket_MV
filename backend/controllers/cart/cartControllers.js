const cartServices = require('../../services/cartServices/cartServices');

const getMyCart = async (req, res) => {
    try {
        const result = await cartServices.getCartDetails(req.user.id);
        return res.status(200).json(result);
    } catch (error) {
        return res.status(500).json(error);
    }
};

const addItem = async (req, res) => {
    try {
        const { product_id, quantity } = req.body;
        const result = await cartServices.addItemToCart(req.user.id, product_id, parseInt(quantity, 10));
        return res.status(200).json(result);
    } catch (error) {
        return res.status(400).json(error);
    }
};

const updateItem = async (req, res) => {
    try {
        const { product_id, quantity } = req.body;
        const result = await cartServices.updateItemQuantity(req.user.id, product_id, parseInt(quantity, 10));
        return res.status(200).json(result);
    } catch (error) {
        return res.status(400).json(error);
    }
};

const removeItem = async (req, res) => {
    try {
        const { productId } = req.params;
        const result = await cartServices.removeItemFromCart(req.user.id, productId);
        return res.status(200).json(result);
    } catch (error) {
        return res.status(400).json(error);
    }
};

const clear = async (req, res) => {
    try {
        const result = await cartServices.clearCart(req.user.id);
        return res.status(200).json(result);
    } catch (error) {
        return res.status(400).json(error);
    }
};

module.exports = {
    getMyCart,
    addItem,
    updateItem,
    removeItem,
    clear
};
