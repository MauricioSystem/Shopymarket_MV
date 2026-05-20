const express = require('express');
const router = express.Router();
const getAllUsers = require('../../controllers/user/getAllUsersController');
const getUserById = require('../../controllers/user/getUserByIdController');
const createUser = require('../../controllers/user/createUserController');
const updateUser = require('../../controllers/user/updateUserController');
const deleteUser = require('../../controllers/user/deleteUserController');
const getUserRoles = require('../../controllers/user/getUserRolesController');
const { authenticate, authorize } = require('../../middlewares');

router.use(authenticate);
router.get('/', authorize('admin', 'super_admin'), getAllUsers);
router.get('/:id', authorize('admin', 'super_admin', 'cliente', 'repartidor'), getUserById);
router.get('/:id/roles', authorize('admin', 'super_admin'), getUserRoles);
router.post('/', authorize('admin', 'super_admin'), createUser);
router.put('/:id', authorize('admin', 'super_admin'), updateUser);
router.delete('/:id', authorize('admin', 'super_admin'), deleteUser);

module.exports = router;
