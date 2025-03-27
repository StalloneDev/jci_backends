const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authenticate } = require('../middleware/auth');

router.post('/login', authController.login);
router.post('/register', authController.register);
router.post('/change-password', authenticate, authController.changePassword);
router.post('/reset-password', authController.resetPassword);

module.exports = router;
