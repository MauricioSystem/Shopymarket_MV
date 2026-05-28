const express = require('express');
const router = express.Router();
const {
    getAllStores,
    getStoreById,
    createStore,
    updateStore,
    deleteStore,
} = require('../../controllers/store/storeControllers');
const { authenticate, authorize } = require('../../middlewares');
// IMPORTANTE: Importar el middleware para gestionar subida de imágenes de tiendas (logo y banner)
const { uploadStoreImage } = require('../../middlewares/uploadMiddleware');

router.get('/', getAllStores);
router.get('/:id', getStoreById);

router.use(authenticate);

// CAMBIO: Se añadió el middleware 'uploadStoreImage.fields' para aceptar la subida física de 'logo' y 'banner' (1 de cada uno máx.) al crear tienda
router.post('/', authorize('admin', 'super_admin'), uploadStoreImage.fields([{ name: 'logo', maxCount: 1 }, { name: 'banner', maxCount: 1 }]), createStore);

// CAMBIO: Se añadió el middleware 'uploadStoreImage.fields' para aceptar la subida física de 'logo' y 'banner' (1 de cada uno máx.) al actualizar tienda
router.put('/:id', authorize('admin', 'super_admin'), uploadStoreImage.fields([{ name: 'logo', maxCount: 1 }, { name: 'banner', maxCount: 1 }]), updateStore);

router.delete('/:id', authorize('admin', 'super_admin'), deleteStore);

module.exports = router;
