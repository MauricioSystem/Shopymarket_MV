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

router.get('/', getAllProducts);
router.get('/store/:storeId', getProductsByStore);
router.get('/category/:categoryId', getProductsByCategory);
router.get('/:id', getProductById);

router.use(authenticate);
router.post('/', authorize('admin', 'super_admin'), createProduct);
router.put('/:id', authorize('admin', 'super_admin'), updateProduct);
router.delete('/:id', authorize('admin', 'super_admin'), deleteProduct);

module.exports = router;
