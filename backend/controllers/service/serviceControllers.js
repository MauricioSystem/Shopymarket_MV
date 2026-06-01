const serviceService = require('../../services/serviceServices/serviceServices');

const getAllServices = async (req, res) => {
    try {
        const result = await serviceService.getAllServices();
        return res.status(200).json(result);
    } catch (error) {
        return res.status(500).json(error);
    }
};

const getServiceById = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await serviceService.getServiceById(id);

        if (!result.success) {
            return res.status(404).json(result);
        }

        return res.status(200).json(result);
    } catch (error) {
        return res.status(500).json(error);
    }
};

const createService = async (req, res) => {
    try {
        const serviceData = { ...req.body };
        // CAMBIO: Si se subió un archivo físico de imagen para el servicio, guardamos su ruta relativa en serviceData
        if (req.file) {
            serviceData.image_url = `/uploads/service_images/${req.file.filename}`;
        }
        const result = await serviceService.createService(serviceData);
        return res.status(201).json(result);
    } catch (error) {
        return res.status(400).json(error);
    }
};

const updateService = async (req, res) => {
    try {
        const { id } = req.params;
        const serviceData = { ...req.body };
        // CAMBIO: Si se subió un nuevo archivo físico de imagen para el servicio al actualizar, guardamos su ruta relativa
        if (req.file) {
            serviceData.image_url = `/uploads/service_images/${req.file.filename}`;
        }
        const result = await serviceService.updateService(id, serviceData);
        return res.status(200).json(result);
    } catch (error) {
        const statusCode = error.error?.includes('not found') ? 404 : 400;
        return res.status(statusCode).json(error);
    }
};

const deleteService = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await serviceService.deleteService(id);
        return res.status(200).json(result);
    } catch (error) {
        const statusCode = error.error?.includes('not found') ? 404 : 400;
        return res.status(statusCode).json(error);
    }
};

// NUEVO: Controller para crear una reservación de servicio
const bookService = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await serviceService.bookService(req.user.id, id, req.body);
        return res.status(200).json(result);
    } catch (error) {
        return res.status(400).json(error);
    }
};

module.exports = {
    getAllServices,
    getServiceById,
    createService,
    updateService,
    deleteService,
    bookService,
};
