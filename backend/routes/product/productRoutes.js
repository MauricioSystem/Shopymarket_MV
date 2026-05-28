const express = require('express');
const router = express.Router();
const {
    getAllProducts,
    getProductById,
    getProductsByStore,
    getProductsByCategory,
    createProduct,
    updateProduct,
    deleteProduct,
} = require('../../controllers/product/productControllers');
const { authenticate, authorize } = require('../../middlewares');
// CAMBIO: Importar el middleware para gestionar subida de imagen de productos
const { uploadProductImage } = require('../../middlewares/uploadMiddleware');

router.get('/', getAllProducts);
router.get('/store/:storeId', getProductsByStore);
router.get('/category/:categoryId', getProductsByCategory);
router.get('/:id', getProductById);

router.use(authenticate);
// CAMBIO: Se añadió 'uploadProductImage.single("image")' para aceptar subida física de imagen de producto al crear
router.post('/', authorize('admin', 'super_admin'), uploadProductImage.single('image'), createProduct);
// CAMBIO: Se añadió 'uploadProductImage.single("image")' para aceptar subida física de imagen de producto al actualizar
router.put('/:id', authorize('admin', 'super_admin'), uploadProductImage.single('image'), updateProduct);
router.delete('/:id', authorize('admin', 'super_admin'), deleteProduct);

module.exports = router;
