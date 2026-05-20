const express = require('express');
const router = express.Router();
const login = require('../../controllers/auth/loginController');
const register = require('../../controllers/auth/registerController');

router.post('/register', register);
router.post('/login', login);

module.exports = router;
