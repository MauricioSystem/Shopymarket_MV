const productModel = require('../../models/productModel');

const createProduct = async (productData) => {
    try {
        if (!productData.store_id || !productData.category_id || !productData.name || productData.price === undefined) {
            throw new Error('store_id, category_id, name and price are required');
        }

        const price = Number(productData.price);
        if (Number.isNaN(price) || price < 0) {
            throw new Error('price must be a valid non-negative number');
        }

        const stock = productData.stock !== undefined ? Number(productData.stock) : 0;
        if (Number.isNaN(stock) || stock < 0) {
            throw new Error('stock must be a valid non-negative integer');
        }

        const product = await productModel.createProduct({
            ...productData,
            price,
            stock,
        });

        return {
            success: true,
            data: product,
            message: 'Product created successfully'
        };
    } catch (error) {
        throw {
            success: false,
            message: 'Error creating product',
            error: error.message
        };
    }
};

const getAllProducts = async () => {
    try {
        const products = await productModel.getAllProducts();
        return {
            success: true,
            data: products,
            message: 'Products retrieved successfully'
        };
    } catch (error) {
        throw {
            success: false,
            message: 'Error retrieving products',
            error: error.message
        };
    }
};

const getProductById = async (productId) => {
    try {
        const product = await productModel.getProductById(productId);
        if (!product) {
            throw new Error('Product not found');
        }

        return {
            success: true,
            data: product,
            message: 'Product retrieved successfully'
        };
    } catch (error) {
        throw {
            success: false,
            message: 'Error retrieving product',
            error: error.message
        };
    }
};

const getProductsByStore = async (storeId) => {
    try {
        const products = await productModel.getProductsByStore(storeId);
        return {
            success: true,
            data: products,
            message: 'Products retrieved successfully'
        };
    } catch (error) {
        throw {
            success: false,
            message: 'Error retrieving products by store',
            error: error.message
        };
    }
};

const getProductsByCategory = async (categoryId) => {
    try {
        const products = await productModel.getProductsByCategory(categoryId);
        return {
            success: true,
            data: products,
            message: 'Products retrieved successfully'
        };
    } catch (error) {
        throw {
            success: false,
            message: 'Error retrieving products by category',
            error: error.message
        };
    }
};

const updateProduct = async (productId, productData) => {
    try {
        if (productData.price !== undefined) {
            const price = Number(productData.price);
            if (Number.isNaN(price) || price < 0) {
                throw new Error('price must be a valid non-negative number');
            }
            productData.price = price;
        }

        if (productData.stock !== undefined) {
            const stock = Number(productData.stock);
            if (Number.isNaN(stock) || stock < 0) {
                throw new Error('stock must be a valid non-negative integer');
            }
            productData.stock = stock;
        }

        const product = await productModel.updateProduct(productId, productData);
        if (!product) {
            throw new Error('Product not found or no valid fields to update');
        }

        return {
            success: true,
            data: product,
            message: 'Product updated successfully'
        };
    } catch (error) {
        throw {
            success: false,
            message: 'Error updating product',
            error: error.message
        };
    }
};

const deleteProduct = async (productId) => {
    try {
        const product = await productModel.deleteProduct(productId);
        if (!product) {
            throw new Error('Product not found');
        }

        return {
            success: true,
            data: product,
            message: 'Product deactivated successfully'
        };
    } catch (error) {
        throw {
            success: false,
            message: 'Error deactivating product',
            error: error.message
        };
    }
};

module.exports = {
    createProduct,
    getAllProducts,
    getProductById,
    getProductsByStore,
    getProductsByCategory,
    updateProduct,
    deleteProduct,
};
