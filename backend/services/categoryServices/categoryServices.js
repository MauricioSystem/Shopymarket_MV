const categoryModel = require('../../models/categoryModel');

const createCategory = async (categoryData) => {
    try {
        if (!categoryData.name) {
            throw new Error('name is required');
        }

        const category = await categoryModel.createCategory(categoryData);
        return {
            success: true,
            data: category,
            message: 'Category created successfully'
        };
    } catch (error) {
        throw {
            success: false,
            message: 'Error creating category',
            error: error.message
        };
    }
};

const getAllCategories = async () => {
    try {
        const categories = await categoryModel.getAllCategories();
        return {
            success: true,
            data: categories,
            message: 'Categories retrieved successfully'
        };
    } catch (error) {
        throw {
            success: false,
            message: 'Error retrieving categories',
            error: error.message
        };
    }
};

const getCategoryById = async (categoryId) => {
    try {
        const category = await categoryModel.getCategoryById(categoryId);
        if (!category) {
            throw new Error('Category not found');
        }

        return {
            success: true,
            data: category,
            message: 'Category retrieved successfully'
        };
    } catch (error) {
        throw {
            success: false,
            message: 'Error retrieving category',
            error: error.message
        };
    }
};

const updateCategory = async (categoryId, categoryData) => {
    try {
        const category = await categoryModel.updateCategory(categoryId, categoryData);
        if (!category) {
            throw new Error('Category not found or no valid fields to update');
        }

        return {
            success: true,
            data: category,
            message: 'Category updated successfully'
        };
    } catch (error) {
        throw {
            success: false,
            message: 'Error updating category',
            error: error.message
        };
    }
};

const deleteCategory = async (categoryId) => {
    try {
        const category = await categoryModel.deleteCategory(categoryId);
        if (!category) {
            throw new Error('Category not found');
        }

        return {
            success: true,
            data: category,
            message: 'Category deactivated successfully'
        };
    } catch (error) {
        throw {
            success: false,
            message: 'Error deactivating category',
            error: error.message
        };
    }
};

module.exports = {
    createCategory,
    getAllCategories,
    getCategoryById,
    updateCategory,
    deleteCategory,
};
