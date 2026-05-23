const subcategoryModel = require('../../models/subcategoryModel');

const createSubcategory = async (subcategoryData) => {
    try {
        if (!subcategoryData.category_id || !subcategoryData.name) {
            throw new Error('category_id and name are required');
        }

        const subcategory = await subcategoryModel.createSubcategory(subcategoryData);
        return {
            success: true,
            data: subcategory,
            message: 'Subcategory created successfully'
        };
    } catch (error) {
        throw {
            success: false,
            message: 'Error creating subcategory',
            error: error.message
        };
    }
};

const getAllSubcategories = async () => {
    try {
        const subcategories = await subcategoryModel.getAllSubcategories();
        return {
            success: true,
            data: subcategories,
            message: 'Subcategories retrieved successfully'
        };
    } catch (error) {
        throw {
            success: false,
            message: 'Error retrieving subcategories',
            error: error.message
        };
    }
};

const getSubcategoryById = async (subcategoryId) => {
    try {
        const subcategory = await subcategoryModel.getSubcategoryById(subcategoryId);
        if (!subcategory) {
            throw new Error('Subcategory not found');
        }

        return {
            success: true,
            data: subcategory,
            message: 'Subcategory retrieved successfully'
        };
    } catch (error) {
        throw {
            success: false,
            message: 'Error retrieving subcategory',
            error: error.message
        };
    }
};

const getSubcategoriesByCategory = async (categoryId) => {
    try {
        const subcategories = await subcategoryModel.getSubcategoriesByCategory(categoryId);
        return {
            success: true,
            data: subcategories,
            message: 'Subcategories retrieved successfully'
        };
    } catch (error) {
        throw {
            success: false,
            message: 'Error retrieving subcategories by category',
            error: error.message
        };
    }
};

const updateSubcategory = async (subcategoryId, subcategoryData) => {
    try {
        const subcategory = await subcategoryModel.updateSubcategory(subcategoryId, subcategoryData);
        if (!subcategory) {
            throw new Error('Subcategory not found or no valid fields to update');
        }

        return {
            success: true,
            data: subcategory,
            message: 'Subcategory updated successfully'
        };
    } catch (error) {
        throw {
            success: false,
            message: 'Error updating subcategory',
            error: error.message
        };
    }
};

const deleteSubcategory = async (subcategoryId) => {
    try {
        const subcategory = await subcategoryModel.deleteSubcategory(subcategoryId);
        if (!subcategory) {
            throw new Error('Subcategory not found');
        }

        return {
            success: true,
            data: subcategory,
            message: 'Subcategory deactivated successfully'
        };
    } catch (error) {
        throw {
            success: false,
            message: 'Error deactivating subcategory',
            error: error.message
        };
    }
};

module.exports = {
    createSubcategory,
    getAllSubcategories,
    getSubcategoryById,
    getSubcategoriesByCategory,
    updateSubcategory,
    deleteSubcategory,
};
