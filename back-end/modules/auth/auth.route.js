const express = require('express');
const router = express.Router();
const authController = require('./auth.controller');
const authMiddleware = require('../../middleware/auth.middleware');

// Public routes
router.post('/register', authController.register.bind(authController));
router.post('/login', authController.login.bind(authController));
router.post('/refresh-token', authController.refreshToken.bind(authController));

// Protected routes
router.post('/logout', authMiddleware, authController.logout.bind(authController));
router.post('/change-password', authMiddleware, authController.changePassword.bind(authController));

module.exports = router;
