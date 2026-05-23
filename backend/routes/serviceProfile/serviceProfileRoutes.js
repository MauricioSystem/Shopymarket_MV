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

router.get('/', getAllServiceProfiles);
router.get('/:id', getServiceProfileById);

router.use(authenticate);
router.post('/', authorize('admin', 'super_admin'), createServiceProfile);
router.put('/:id', authorize('admin', 'super_admin'), updateServiceProfile);
router.delete('/:id', authorize('admin', 'super_admin'), deleteServiceProfile);

module.exports = router;
