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

router.get('/', getAllServices);
router.get('/:id', getServiceById);

router.use(authenticate);
router.post('/', authorize('admin', 'super_admin'), createService);
router.put('/:id', authorize('admin', 'super_admin'), updateService);
router.delete('/:id', authorize('admin', 'super_admin'), deleteService);

module.exports = router;
