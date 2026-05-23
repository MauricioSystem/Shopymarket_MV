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

router.get('/', getAllStores);
router.get('/:id', getStoreById);

router.use(authenticate);
router.post('/', authorize('admin', 'super_admin'), createStore);
router.put('/:id', authorize('admin', 'super_admin'), updateStore);
router.delete('/:id', authorize('admin', 'super_admin'), deleteStore);

module.exports = router;
