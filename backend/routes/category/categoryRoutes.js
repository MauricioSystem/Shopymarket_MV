const express = require('express');
const router = express.Router();
const {
    getAllCategories,
    getCategoryById,
    createCategory,
    updateCategory,
    deleteCategory,
} = require('../../controllers/category/categoryControllers');
const { authenticate, authorize } = require('../../middlewares');

router.get('/', getAllCategories);
router.get('/:id', getCategoryById);

router.use(authenticate);
router.post('/', authorize('admin', 'super_admin'), createCategory);
router.put('/:id', authorize('admin', 'super_admin'), updateCategory);
router.delete('/:id', authorize('admin', 'super_admin'), deleteCategory);

module.exports = router;
