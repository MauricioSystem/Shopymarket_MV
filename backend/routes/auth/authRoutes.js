const express = require('express');
const router = express.Router();
const login = require('../../controllers/auth/loginController');
const { loginAdmin } = require('../../controllers/auth/loginController');
const register = require('../../controllers/auth/registerController');
const reactivate = require('../../controllers/auth/reactivateController');

router.post('/register', register);
router.post('/login', login);
router.post('/loginAdmin', loginAdmin);
router.post('/reactivate', reactivate.requestCode);
router.post('/reactivate/request', reactivate.requestCode);
router.post('/reactivate/verify', reactivate.verifyCode);
router.put('/reactivate/password', reactivate.resetPassword);

module.exports = router;
