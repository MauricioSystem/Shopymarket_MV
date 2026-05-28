const express = require('express');
const router = express.Router();
const {
    getAllServiceProfiles,
    getServiceProfileById,
    createServiceProfile,
    updateServiceProfile,
    deleteServiceProfile,
} = require('../../controllers/serviceProfile/serviceProfileControllers');
const { authenticate, authorize } = require('../../middlewares');
// CAMBIO: Importar el middleware para gestionar subida de imágenes de perfiles de servicios (logo y banner, reutilizando las de tiendas)
const { uploadStoreImage } = require('../../middlewares/uploadMiddleware');

router.get('/', getAllServiceProfiles);
router.get('/:id', getServiceProfileById);

router.use(authenticate);
// CAMBIO: Se añadió 'uploadStoreImage.fields' para aceptar archivos físicos 'logo' y 'banner' al crear perfil de servicios
router.post('/', authorize('admin', 'super_admin'), uploadStoreImage.fields([{ name: 'logo', maxCount: 1 }, { name: 'banner', maxCount: 1 }]), createServiceProfile);
// CAMBIO: Se añadió 'uploadStoreImage.fields' para aceptar archivos físicos 'logo' y 'banner' al actualizar perfil de servicios
router.put('/:id', authorize('admin', 'super_admin'), uploadStoreImage.fields([{ name: 'logo', maxCount: 1 }, { name: 'banner', maxCount: 1 }]), updateServiceProfile);
router.delete('/:id', authorize('admin', 'super_admin'), deleteServiceProfile);

module.exports = router;
