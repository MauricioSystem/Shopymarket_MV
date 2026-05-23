const serviceProfileModel = require('../../models/serviceProfileModel');

const createServiceProfile = async (profileData) => {
    try {
        if (!profileData.name || !profileData.admin_user_id) {
            throw new Error('name and admin_user_id are required');
        }

        const profile = await serviceProfileModel.createServiceProfile(profileData);

        return {
            success: true,
            data: profile,
            message: 'Service profile created successfully'
        };
    } catch (error) {
        throw {
            success: false,
            message: 'Error creating service profile',
            error: error.message
        };
    }
};

const getAllServiceProfiles = async () => {
    try {
        const profiles = await serviceProfileModel.getAllServiceProfiles();
        return {
            success: true,
            data: profiles,
            message: 'Service profiles retrieved successfully'
        };
    } catch (error) {
        throw {
            success: false,
            message: 'Error retrieving service profiles',
            error: error.message
        };
    }
};

const getServiceProfileById = async (profileId) => {
    try {
        const profile = await serviceProfileModel.getServiceProfileById(profileId);
        if (!profile) {
            throw new Error('Service profile not found');
        }

        return {
            success: true,
            data: profile,
            message: 'Service profile retrieved successfully'
        };
    } catch (error) {
        throw {
            success: false,
            message: 'Error retrieving service profile',
            error: error.message
        };
    }
};

const updateServiceProfile = async (profileId, profileData) => {
    try {
        const profile = await serviceProfileModel.updateServiceProfile(profileId, profileData);
        if (!profile) {
            throw new Error('Service profile not found or no valid fields to update');
        }

        return {
            success: true,
            data: profile,
            message: 'Service profile updated successfully'
        };
    } catch (error) {
        throw {
            success: false,
            message: 'Error updating service profile',
            error: error.message
        };
    }
};

const deleteServiceProfile = async (profileId) => {
    try {
        const profile = await serviceProfileModel.deleteServiceProfile(profileId);
        if (!profile) {
            throw new Error('Service profile not found');
        }

        return {
            success: true,
            data: profile,
            message: 'Service profile deactivated successfully'
        };
    } catch (error) {
        throw {
            success: false,
            message: 'Error deactivating service profile',
            error: error.message
        };
    }
};

module.exports = {
    createServiceProfile,
    getAllServiceProfiles,
    getServiceProfileById,
    updateServiceProfile,
    deleteServiceProfile,
};
