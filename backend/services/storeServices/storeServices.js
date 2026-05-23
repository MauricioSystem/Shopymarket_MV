const storeModel = require('../../models/storeModel');

const createStore = async (storeData) => {
    try {
        if (!storeData.name || !storeData.admin_user_id) {
            throw new Error('name and admin_user_id are required');
        }

        const store = await storeModel.createStore(storeData);

        return {
            success: true,
            data: store,
            message: 'Store created successfully'
        };
    } catch (error) {
        throw {
            success: false,
            message: 'Error creating store',
            error: error.message
        };
    }
};

const getAllStores = async () => {
    try {
        const stores = await storeModel.getAllStores();
        return {
            success: true,
            data: stores,
            message: 'Stores retrieved successfully'
        };
    } catch (error) {
        throw {
            success: false,
            message: 'Error retrieving stores',
            error: error.message
        };
    }
};

const getStoreById = async (storeId) => {
    try {
        const store = await storeModel.getStoreById(storeId);
        if (!store) {
            throw new Error('Store not found');
        }

        return {
            success: true,
            data: store,
            message: 'Store retrieved successfully'
        };
    } catch (error) {
        throw {
            success: false,
            message: 'Error retrieving store',
            error: error.message
        };
    }
};

const updateStore = async (storeId, storeData) => {
    try {
        const store = await storeModel.updateStore(storeId, storeData);
        if (!store) {
            throw new Error('Store not found or no valid fields to update');
        }

        return {
            success: true,
            data: store,
            message: 'Store updated successfully'
        };
    } catch (error) {
        throw {
            success: false,
            message: 'Error updating store',
            error: error.message
        };
    }
};

const deleteStore = async (storeId) => {
    try {
        const store = await storeModel.deleteStore(storeId);
        if (!store) {
            throw new Error('Store not found');
        }

        return {
            success: true,
            data: store,
            message: 'Store deactivated successfully'
        };
    } catch (error) {
        throw {
            success: false,
            message: 'Error deactivating store',
            error: error.message
        };
    }
};

const getStoreByUserId = async (userId) => {
    try {
        if (!userId) {
            throw new Error('userId is required');
        }

        const store = await storeModel.getStoreByUserId(userId);
        if (!store) {
            throw new Error('Store not found for this user');
        }

        return {
            success: true,
            data: store,
            message: 'Store retrieved successfully'
        };
    } catch (error) {
        throw {
            success: false,
            message: 'Error retrieving user store',
            error: error.message
        };
    }
};

const updateMyStore = async (userId, storeData) => {
    try {
        if (!userId) {
            throw new Error('userId is required');
        }

        const store = await storeModel.getStoreByUserId(userId);
        if (!store) {
            throw new Error('Store not found');
        }

        const updatedStore = await storeModel.updateStore(store.id, storeData);
        if (!updatedStore) {
            throw new Error('Failed to update store');
        }

        return {
            success: true,
            data: updatedStore,
            message: 'Store updated successfully'
        };
    } catch (error) {
        throw {
            success: false,
            message: 'Error updating store',
            error: error.message
        };
    }
};

module.exports = {
    createStore,
    getAllStores,
    getStoreById,
    getStoreByUserId,
    updateStore,
    deleteStore,
    updateMyStore,
};
