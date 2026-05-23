const serviceModel = require('../../models/serviceModel');

const createService = async (serviceData) => {
    try {
        if (!serviceData.service_profile_id || !serviceData.category_id || !serviceData.name || serviceData.price === undefined) {
            throw new Error('service_profile_id, category_id, name and price are required');
        }

        const price = Number(serviceData.price);
        if (Number.isNaN(price) || price < 0) {
            throw new Error('price must be a valid non-negative number');
        }

        const service = await serviceModel.createService({
            ...serviceData,
            price,
        });

        return {
            success: true,
            data: service,
            message: 'Service created successfully'
        };
    } catch (error) {
        throw {
            success: false,
            message: 'Error creating service',
            error: error.message
        };
    }
};

const getAllServices = async () => {
    try {
        const services = await serviceModel.getAllServices();
        return {
            success: true,
            data: services,
            message: 'Services retrieved successfully'
        };
    } catch (error) {
        throw {
            success: false,
            message: 'Error retrieving services',
            error: error.message
        };
    }
};

const getServiceById = async (serviceId) => {
    try {
        const service = await serviceModel.getServiceById(serviceId);
        if (!service) {
            throw new Error('Service not found');
        }

        return {
            success: true,
            data: service,
            message: 'Service retrieved successfully'
        };
    } catch (error) {
        throw {
            success: false,
            message: 'Error retrieving service',
            error: error.message
        };
    }
};

const updateService = async (serviceId, serviceData) => {
    try {
        if (serviceData.price !== undefined) {
            const price = Number(serviceData.price);
            if (Number.isNaN(price) || price < 0) {
                throw new Error('price must be a valid non-negative number');
            }
            serviceData.price = price;
        }

        const service = await serviceModel.updateService(serviceId, serviceData);
        if (!service) {
            throw new Error('Service not found or no valid fields to update');
        }

        return {
            success: true,
            data: service,
            message: 'Service updated successfully'
        };
    } catch (error) {
        throw {
            success: false,
            message: 'Error updating service',
            error: error.message
        };
    }
};

const deleteService = async (serviceId) => {
    try {
        const service = await serviceModel.deleteService(serviceId);
        if (!service) {
            throw new Error('Service not found');
        }

        return {
            success: true,
            data: service,
            message: 'Service deactivated successfully'
        };
    } catch (error) {
        throw {
            success: false,
            message: 'Error deactivating service',
            error: error.message
        };
    }
};

module.exports = {
    createService,
    getAllServices,
    getServiceById,
    updateService,
    deleteService,
};
