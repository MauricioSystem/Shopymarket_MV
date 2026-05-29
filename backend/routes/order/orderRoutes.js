const express = require('express');
const router = express.Router();
const {
    createOrder,
    getOrderById,
    getMyOrders,
    getStoreOrders,
    getAllOrders,
    updateStatus
} = require('../../controllers/order/orderControllers');
const { authenticate, authorize } = require('../../middlewares');

router.use(authenticate);

router.post('/', authorize('cliente'), createOrder);
router.get('/my-orders', authorize('cliente'), getMyOrders);
router.get('/store/:storeId', authorize('admin', 'super_admin'), getStoreOrders);
router.get('/all', authorize('super_admin'), getAllOrders);
router.get('/:id', getOrderById);
router.put('/:id/status', authorize('admin', 'super_admin', 'repartidor'), updateStatus);

module.exports = router;
