const productService = require('../../services/productServices/productServices');

const getAllProducts = async (req, res) => {
    try {
        const result = await productService.getAllProducts();
        return res.status(200).json(result);
    } catch (error) {
        return res.status(500).json(error);
    }
};

const getProductById = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await productService.getProductById(id);
        return res.status(200).json(result);
    } catch (error) {
        const statusCode = error.error?.includes('not found') ? 404 : 400;
        return res.status(statusCode).json(error);
    }
};

const getProductsByStore = async (req, res) => {
    try {
        const { storeId } = req.params;
        const result = await productService.getProductsByStore(storeId);
        return res.status(200).json(result);
    } catch (error) {
        return res.status(500).json(error);
    }
};

const getProductsByCategory = async (req, res) => {
    try {
        const { categoryId } = req.params;
        const result = await productService.getProductsByCategory(categoryId);
        return res.status(200).json(result);
    } catch (error) {
        return res.status(500).json(error);
    }
};

const createProduct = async (req, res) => {
    try {
        const result = await productService.createProduct(req.body);
        return res.status(201).json(result);
    } catch (error) {
        return res.status(400).json(error);
    }
};

const updateProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await productService.updateProduct(id, req.body);
        return res.status(200).json(result);
    } catch (error) {
        const statusCode = error.error?.includes('not found') ? 404 : 400;
        return res.status(statusCode).json(error);
    }
};

const deleteProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await productService.deleteProduct(id);
        return res.status(200).json(result);
    } catch (error) {
        const statusCode = error.error?.includes('not found') ? 404 : 400;
        return res.status(statusCode).json(error);
    }
};

module.exports = {
    getAllProducts,
    getProductById,
    getProductsByStore,
    getProductsByCategory,
    createProduct,
    updateProduct,
    deleteProduct,
};
