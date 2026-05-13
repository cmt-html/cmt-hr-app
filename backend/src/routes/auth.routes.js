const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth/auth.controller');

router.post('/register', authController.registerOrganization);
router.post('/login', authController.login);

module.exports = router;
