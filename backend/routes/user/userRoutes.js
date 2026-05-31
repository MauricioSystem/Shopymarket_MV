const express = require('express');
const router = express.Router();
const getAllUsers = require('../../controllers/user/getAllUsersController');
const getUserById = require('../../controllers/user/getUserByIdController');
const createUser = require('../../controllers/user/createUserController');
const updateUser = require('../../controllers/user/updateUserController');
const deleteUser = require('../../controllers/user/deleteUserController');
const getUserRoles = require('../../controllers/user/getUserRolesController');
const { authenticate, authorize, authorizeProfileUpdate } = require('../../middlewares');
const { uploadProfileImage } = require('../../middlewares/uploadMiddleware');

router.use(authenticate);
router.get('/', authorize('admin', 'super_admin'), getAllUsers);
router.get('/:id', authorize('admin', 'super_admin', 'cliente', 'repartidor'), getUserById);
router.get('/:id/roles', authorize('admin', 'super_admin'), getUserRoles);
router.post('/', authorize('admin', 'super_admin'), createUser);
router.put('/:id', authorizeProfileUpdate, uploadProfileImage.single('profile_image'), updateUser);

router.delete('/:id', (req, res, next) => {
    const targetUserId = parseInt(req.params.id, 10);
    const currentUserId = parseInt(req.user.id, 10);
    const userRole = req.user.role;

    if (userRole === 'super_admin' || userRole === 'admin' || currentUserId === targetUserId) {
        return next();
    }

    return res.status(403).json({
        success: false,
        message: 'Insufficient privileges to delete this account'
    });
}, deleteUser);

module.exports = router;
