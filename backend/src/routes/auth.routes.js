const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth/auth.controller');

router.post('/register', authController.registerOrganization);
router.post('/login', authController.login);
router.post('/refresh', authController.refresh);
router.get('/invite/:inviteId', authController.getInviteDetails);
router.post('/accept-invite', authController.acceptInvite);

module.exports = router;
