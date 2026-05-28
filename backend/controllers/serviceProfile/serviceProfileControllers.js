const serviceProfileService = require('../../services/serviceProfileServices/serviceProfileServices');

const getAllServiceProfiles = async (req, res) => {
    try {
        const result = await serviceProfileService.getAllServiceProfiles();
        return res.status(200).json(result);
    } catch (error) {
        return res.status(500).json(error);
    }
};

const getServiceProfileById = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await serviceProfileService.getServiceProfileById(id);

        if (!result.success) {
            return res.status(404).json(result);
        }

        return res.status(200).json(result);
    } catch (error) {
        return res.status(500).json(error);
    }
};

const createServiceProfile = async (req, res) => {
    try {
        const profileData = {
            ...req.body,
            admin_user_id: req.user?.id,
        };

        // CAMBIO: Si se subieron archivos físicos (logo y/o banner) usando el middleware, guardamos la ruta relativa
        if (req.files) {
            if (req.files.logo) {
                profileData.profile_image_url = `/uploads/store_images/${req.files.logo[0].filename}`;
            }
            if (req.files.banner) {
                profileData.banner_url = `/uploads/store_images/${req.files.banner[0].filename}`;
            }
        }

        const result = await serviceProfileService.createServiceProfile(profileData);
        return res.status(201).json(result);
    } catch (error) {
        return res.status(400).json(error);
    }
};

const updateServiceProfile = async (req, res) => {
    try {
        const { id } = req.params;
        const profileData = { ...req.body };

        // CAMBIO: Si se subieron nuevos archivos físicos (logo y/o banner) en la actualización, actualizamos la ruta relativa
        if (req.files) {
            if (req.files.logo) {
                profileData.profile_image_url = `/uploads/store_images/${req.files.logo[0].filename}`;
            }
            if (req.files.banner) {
                profileData.banner_url = `/uploads/store_images/${req.files.banner[0].filename}`;
            }
        }

        const result = await serviceProfileService.updateServiceProfile(id, profileData);
        return res.status(200).json(result);
    } catch (error) {
        const statusCode = error.error?.includes('not found') ? 404 : 400;
        return res.status(statusCode).json(error);
    }
};

const deleteServiceProfile = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await serviceProfileService.deleteServiceProfile(id);
        return res.status(200).json(result);
    } catch (error) {
        const statusCode = error.error?.includes('not found') ? 404 : 400;
        return res.status(statusCode).json(error);
    }
};

module.exports = {
    getAllServiceProfiles,
    getServiceProfileById,
    createServiceProfile,
    updateServiceProfile,
    deleteServiceProfile,
};
