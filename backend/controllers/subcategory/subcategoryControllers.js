const subcategoryService = require('../../services/subcategoryServices/subcategoryServices');

const getAllSubcategories = async (req, res) => {
    try {
        const result = await subcategoryService.getAllSubcategories();
        return res.status(200).json(result);
    } catch (error) {
        return res.status(500).json(error);
    }
};

const getSubcategoryById = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await subcategoryService.getSubcategoryById(id);

        if (!result.success) {
            return res.status(404).json(result);
        }

        return res.status(200).json(result);
    } catch (error) {
        return res.status(500).json(error);
    }
};

const getSubcategoriesByCategory = async (req, res) => {
    try {
        const { categoryId } = req.params;
        const result = await subcategoryService.getSubcategoriesByCategory(categoryId);
        return res.status(200).json(result);
    } catch (error) {
        return res.status(500).json(error);
    }
};

const createSubcategory = async (req, res) => {
    try {
        const result = await subcategoryService.createSubcategory(req.body);
        return res.status(201).json(result);
    } catch (error) {
        return res.status(400).json(error);
    }
};

const updateSubcategory = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await subcategoryService.updateSubcategory(id, req.body);
        return res.status(200).json(result);
    } catch (error) {
        const statusCode = error.error?.includes('not found') ? 404 : 400;
        return res.status(statusCode).json(error);
    }
};

const deleteSubcategory = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await subcategoryService.deleteSubcategory(id);
        return res.status(200).json(result);
    } catch (error) {
        const statusCode = error.error?.includes('not found') ? 404 : 400;
        return res.status(statusCode).json(error);
    }
};

module.exports = {
    getAllSubcategories,
    getSubcategoryById,
    getSubcategoriesByCategory,
    createSubcategory,
    updateSubcategory,
    deleteSubcategory,
};
