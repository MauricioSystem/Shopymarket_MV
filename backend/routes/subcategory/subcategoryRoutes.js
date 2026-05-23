const express = require('express');
const router = express.Router();
const {
    getAllSubcategories,
    getSubcategoryById,
    getSubcategoriesByCategory,
    createSubcategory,
    updateSubcategory,
    deleteSubcategory,
} = require('../../controllers/subcategory/subcategoryControllers');
const { authenticate, authorize } = require('../../middlewares');

router.get('/', getAllSubcategories);
router.get('/category/:categoryId', getSubcategoriesByCategory);
router.get('/:id', getSubcategoryById);

router.use(authenticate);
router.post('/', authorize('admin', 'super_admin'), createSubcategory);
router.put('/:id', authorize('admin', 'super_admin'), updateSubcategory);
router.delete('/:id', authorize('admin', 'super_admin'), deleteSubcategory);

module.exports = router;
