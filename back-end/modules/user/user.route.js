const express = require('express');
const router = express.Router();
const userController = require('./user.controller');
const authMiddleware = require('../../middleware/auth.middleware');
const { requireRoles } = require('../../middleware/role.middleware');

// Current user (any authenticated role)
router.get('/profile/me', authMiddleware, userController.getProfile.bind(userController));
router.put('/profile/me', authMiddleware, userController.updateProfile.bind(userController));

// Admin-only user management
router.get('/', authMiddleware, requireRoles('admin'), userController.getAllUsers.bind(userController));
router.post('/', authMiddleware, requireRoles('admin'), userController.createUser.bind(userController));
router.put('/:id', authMiddleware, requireRoles('admin'), userController.updateUser.bind(userController));
router.delete('/:id', authMiddleware, requireRoles('admin'), userController.deleteUser.bind(userController));
router.patch('/:id/deactivate', authMiddleware, requireRoles('admin'), userController.deactivateUser.bind(userController));
router.patch('/:id/activate', authMiddleware, requireRoles('admin'), userController.activateUser.bind(userController));

// Single user: admin hoặc chính user đó (controller kiểm tra)
router.get('/:id', authMiddleware, userController.getUserById.bind(userController));

module.exports = router;
