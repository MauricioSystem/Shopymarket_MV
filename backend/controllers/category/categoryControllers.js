const categoryService = require('../../services/categoryServices/categoryServices');

const getAllCategories = async (req, res) => {
    try {
        const result = await categoryService.getAllCategories();
        return res.status(200).json(result);
    } catch (error) {
        return res.status(500).json(error);
    }
};

const getCategoryById = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await categoryService.getCategoryById(id);

        if (!result.success) {
            return res.status(404).json(result);
        }

        return res.status(200).json(result);
    } catch (error) {
        return res.status(500).json(error);
    }
};

const createCategory = async (req, res) => {
    try {
        const result = await categoryService.createCategory(req.body);
        return res.status(201).json(result);
    } catch (error) {
        return res.status(400).json(error);
    }
};

const updateCategory = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await categoryService.updateCategory(id, req.body);
        return res.status(200).json(result);
    } catch (error) {
        const statusCode = error.error?.includes('not found') ? 404 : 400;
        return res.status(statusCode).json(error);
    }
};

const deleteCategory = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await categoryService.deleteCategory(id);
        return res.status(200).json(result);
    } catch (error) {
        const statusCode = error.error?.includes('not found') ? 404 : 400;
        return res.status(statusCode).json(error);
    }
};

module.exports = {
    getAllCategories,
    getCategoryById,
    createCategory,
    updateCategory,
    deleteCategory,
};
