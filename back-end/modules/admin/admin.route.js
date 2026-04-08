const express = require('express');
const router = express.Router();
const adminController = require('./admin.controller');

// Admin routes
router.get('/', adminController.getAllAdmins.bind(adminController));
router.get('/:id', adminController.getAdminById.bind(adminController));
router.post('/', adminController.createAdmin.bind(adminController));
router.put('/:id', adminController.updateAdmin.bind(adminController));
router.delete('/:id', adminController.deleteAdmin.bind(adminController));

// Permission routes
router.post('/:id/grant-permission', adminController.grantPermission.bind(adminController));
router.post('/:id/revoke-permission', adminController.revokePermission.bind(adminController));

// Activity log routes
router.get('/:id/activity-log', adminController.getActivityLog.bind(adminController));

module.exports = router;
