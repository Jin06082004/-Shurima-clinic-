const express = require('express');
const router = express.Router();
const userController = require('./user.controller');
const authMiddleware = require('../../middleware/auth.middleware');

// Public routes
router.get('/', userController.getAllUsers.bind(userController));
router.get('/:id', userController.getUserById.bind(userController));

// Admin routes
router.post('/', userController.createUser.bind(userController));
router.put('/:id', userController.updateUser.bind(userController));
router.delete('/:id', userController.deleteUser.bind(userController));
router.patch('/:id/deactivate', userController.deactivateUser.bind(userController));
router.patch('/:id/activate', userController.activateUser.bind(userController));

// Protected routes
router.get('/profile/me', authMiddleware, userController.getProfile.bind(userController));
router.put('/profile/me', authMiddleware, userController.updateProfile.bind(userController));

module.exports = router;
