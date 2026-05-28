const express = require('express');
const router = express.Router();
const {
    getAllServices,
    getServiceById,
    createService,
    updateService,
    deleteService,
} = require('../../controllers/service/serviceControllers');
const { authenticate, authorize } = require('../../middlewares');
// CAMBIO: Importar middleware para subida física de imágenes de servicios
const { uploadServiceImage } = require('../../middlewares/uploadMiddleware');

router.get('/', getAllServices);
router.get('/:id', getServiceById);

router.use(authenticate);
// CAMBIO: Se añadió 'uploadServiceImage.single("image")' para aceptar subidas de imágenes
router.post('/', authorize('admin', 'super_admin'), uploadServiceImage.single('image'), createService);
// CAMBIO: Se añadió 'uploadServiceImage.single("image")' para aceptar subidas de imágenes en la actualización
router.put('/:id', authorize('admin', 'super_admin'), uploadServiceImage.single('image'), updateService);
router.delete('/:id', authorize('admin', 'super_admin'), deleteService);

module.exports = router;
