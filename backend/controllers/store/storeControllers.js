const storeService = require('../../services/storeServices/storeServices');

const getAllStores = async (req, res) => {
    try {
        const result = await storeService.getAllStores();
        return res.status(200).json(result);
    } catch (error) {
        return res.status(500).json(error);
    }
};

const getStoreById = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await storeService.getStoreById(id);

        if (!result.success) {
            return res.status(404).json(result);
        }

        return res.status(200).json(result);
    } catch (error) {
        return res.status(500).json(error);
    }
};

const createStore = async (req, res) => {
    console.log('DEBUG backend createStore:', {
        headers: req.headers,
        body: req.body,
        files: req.files,
        user: req.user
    });
    try {
        const storeData = {
            ...req.body,
            admin_user_id: req.user?.id,
        };

        // CAMBIO: Si se subieron archivos físicos (logo y/o banner), guardamos su ruta relativa en storeData
        if (req.files) {
            if (req.files.logo) {
                storeData.logo_url = `/uploads/store_images/${req.files.logo[0].filename}`;
            }
            if (req.files.banner) {
                storeData.banner_url = `/uploads/store_images/${req.files.banner[0].filename}`;
            }
        }

        const result = await storeService.createStore(storeData);
        return res.status(201).json(result);
    } catch (error) {
        return res.status(400).json(error);
    }
};

const updateStore = async (req, res) => {
    try {
        const { id } = req.params;
        const storeData = { ...req.body };

        // CAMBIO: Si se subieron nuevos archivos físicos (logo y/o banner) en la actualización, guardamos su ruta relativa
        if (req.files) {
            if (req.files.logo) {
                storeData.logo_url = `/uploads/store_images/${req.files.logo[0].filename}`;
            }
            if (req.files.banner) {
                storeData.banner_url = `/uploads/store_images/${req.files.banner[0].filename}`;
            }
        }

        const result = await storeService.updateStore(id, storeData);
        return res.status(200).json(result);
    } catch (error) {
        const statusCode = error.error?.includes('not found') ? 404 : 400;
        return res.status(statusCode).json(error);
    }
};

const deleteStore = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await storeService.deleteStore(id);
        return res.status(200).json(result);
    } catch (error) {
        const statusCode = error.error?.includes('not found') ? 404 : 400;
        return res.status(statusCode).json(error);
    }
};

const getMyStore = async (req, res) => {
    try {
        const userId = req.user?.id;
        const result = await storeService.getStoreByUserId(userId);

        if (!result.success) {
            return res.status(404).json(result);
        }

        return res.status(200).json(result);
    } catch (error) {
        return res.status(500).json(error);
    }
};

const updateMyStore = async (req, res) => {
    try {
        const userId = req.user?.id;
        const storeData = { ...req.body };

        if (req.files) {
            if (req.files.logo) {
                storeData.logo_url = `/uploads/store_images/${req.files.logo[0].filename}`;
            }
            if (req.files.banner) {
                storeData.banner_url = `/uploads/store_images/${req.files.banner[0].filename}`;
            }
        }

        const result = await storeService.updateMyStore(userId, storeData);
        return res.status(200).json(result);
    } catch (error) {
        const statusCode = error.error?.includes('not found') ? 404 : 400;
        return res.status(statusCode).json(error);
    }
};

module.exports = {
    getAllStores,
    getStoreById,
    createStore,
    updateStore,
    deleteStore,
    getMyStore,
    updateMyStore,
};
