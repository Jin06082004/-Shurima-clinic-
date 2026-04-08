const notificationService = require('./notification.service');

class NotificationController {
  /**
   * GET /notifications
   * Lấy danh sách thông báo của user đang đăng nhập.
   */
  async getMyNotifications(req, res) {
    try {
      const userId = req.user.userId;
      const { page = 1, limit = 20 } = req.query;

      const result = await notificationService.getByUser(userId, {
        page: parseInt(page, 10),
        limit: parseInt(limit, 10),
      });

      return res.status(200).json({
        success: true,
        message: 'Notifications retrieved',
        data: result,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  /**
   * GET /notifications/unread-count
   * Trả số thông báo chưa đọc.
   */
  async getUnreadCount(req, res) {
    try {
      const userId = req.user.userId;
      const result = await notificationService.getByUser(userId, { page: 1, limit: 1 });
      return res.status(200).json({
        success: true,
        data: { unreadCount: result.unreadCount },
      });
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  /**
   * PATCH /notifications/:id/read
   * Đánh dấu 1 thông báo là đã đọc.
   */
  async markAsRead(req, res) {
    try {
      const userId = req.user.userId;
      const { id } = req.params;

      const notif = await notificationService.markAsRead(id, userId);
      if (!notif) {
        return res.status(404).json({
          success: false,
          message: 'Thông báo không tìm thấy hoặc bạn không có quyền.',
        });
      }

      return res.status(200).json({
        success: true,
        message: 'Đã đánh dấu đã đọc',
        data: notif,
      });
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  /**
   * POST /notifications/mark-all-read
   */
  async markAllAsRead(req, res) {
    try {
      const userId = req.user.userId;
      await notificationService.markAllAsRead(userId);
      return res.status(200).json({
        success: true,
        message: 'Tất cả thông báo đã đánh dấu đã đọc',
      });
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  /**
   * DELETE /notifications/:id
   */
  async deleteNotification(req, res) {
    try {
      const userId = req.user.userId;
      const { id } = req.params;

      const result = await notificationService.delete(id, userId);
      return res.status(200).json({
        success: true,
        message: result.message,
      });
    } catch (error) {
      return res.status(400).json({ success: false, message: error.message });
    }
  }

  /**
   * DELETE /notifications
   * Xóa tất cả thông báo của user.
   */
  async deleteAll(req, res) {
    try {
      const userId = req.user.userId;
      await notificationService.deleteAll(userId);
      return res.status(200).json({
        success: true,
        message: 'Đã xóa tất cả thông báo',
      });
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }
}

module.exports = new NotificationController();
