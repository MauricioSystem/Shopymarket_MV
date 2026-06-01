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

//NUEVO: Para que los clientes reserven servicios BREVO
const bookService = async (userId, serviceId, bookingData) => {
    try {
        const userModel = require('../../models/userModel');
        const serviceProfileModel = require('../../models/serviceProfileModel');
        const emailService = require('../emailService/emailService');
        const pool = require('../../src/db/database');

        const { date, dateType, dateEnd, time, notes } = bookingData;

        // 1. Get user
        const user = await userModel.getUserById(userId);
        if (!user) {
            throw new Error('User not found');
        }

        // 2. Get service
        const service = await serviceModel.getServiceById(serviceId);
        if (!service) {
            throw new Error('Service not found');
        }

        // 3. Get provider (service profile)
        const provider = await serviceProfileModel.getServiceProfileById(service.service_profile_id);

        // Sincronizar contacto al CRM (por si es un usuario antiguo)
        try {
            await emailService.addContactToBrevo(user);
        } catch (crmErr) {
            console.error('[Brevo CRM] Error al sincronizar contacto en reserva:', crmErr.message);
        }

        // 4. Increment contracts_count in database
        await pool.query(
            'UPDATE services SET contracts_count = contracts_count + 1 WHERE id = $1',
            [serviceId]
        );

        // 5. Send Brevo email (silently with try/catch)
        try {
            await emailService.sendServiceBookingEmail(user, service, provider, bookingData);
        } catch (emailErr) {
            console.error('[Brevo] ❌ Error enviando email de reserva de servicio:', emailErr.message);
        }

        return {
            success: true,
            message: 'Service reservation requested successfully'
        };
    } catch (error) {
        throw {
            success: false,
            message: 'Error booking service',
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
    bookService,
};
