const express = require('express');
const router = express.Router();
const notificationController = require('./notification.controller');
const authMiddleware = require('../../middleware/auth.middleware');

// Tất cả route notification đều cần đăng nhập
router.use(authMiddleware);

// Lấy danh sách & số chưa đọc
router.get('/', notificationController.getMyNotifications.bind(notificationController));
router.get('/unread-count', notificationController.getUnreadCount.bind(notificationController));

// Đánh dấu đã đọc
router.patch('/:id/read', notificationController.markAsRead.bind(notificationController));
router.post('/mark-all-read', notificationController.markAllAsRead.bind(notificationController));

// Xóa
router.delete('/:id', notificationController.deleteNotification.bind(notificationController));
router.delete('/', notificationController.deleteAll.bind(notificationController));

module.exports = router;
