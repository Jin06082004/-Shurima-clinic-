const Notification = require('./notification.model');

class NotificationService {
  /**
   * Tạo một thông báo mới cho user.
   * @param {object} data
   */
  async create(data) {
    const notif = await Notification.create(data);
    return notif;
  }

  /**
   * Tạo thông báo kèm save notification ngay trong service.
   * Trả về notification đã tạo.
   */
  async createAndSave(data) {
    return Notification.create(data);
  }

  /**
   * Lấy danh sách thông báo của một user (phân trang).
   * @param {string} userId
   * @param {object} pagination  { page, limit }
   */
  async getByUser(userId, pagination = {}) {
    const { page = 1, limit = 20 } = pagination;
    const skip = (page - 1) * limit;

    const [notifications, total, unreadCount] = await Promise.all([
      Notification.find({ userId })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .select('-__v')
        .lean(),
      Notification.countDocuments({ userId }),
      Notification.countDocuments({ userId, isRead: false }),
    ]);

    return {
      notifications,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
      unreadCount,
    };
  }

  /**
   * Đánh dấu một thông báo là đã đọc.
   * @param {string} notifId
   * @param {string} userId  — chỉ cho phép đọc notification thuộc về mình
   */
  async markAsRead(notifId, userId) {
    const notif = await Notification.findOneAndUpdate(
      { _id: notifId, userId },
      { isRead: true, readAt: new Date() },
      { new: true }
    );
    return notif;
  }

  /**
   * Đánh dấu TẤT CẢ thông báo của user là đã đọc.
   */
  async markAllAsRead(userId) {
    await Notification.updateMany(
      { userId, isRead: false },
      { isRead: true, readAt: new Date() }
    );
    return { message: 'All notifications marked as read' };
  }

  /**
   * Xóa một thông báo.
   */
  async delete(notifId, userId) {
    const result = await Notification.findOneAndDelete({ _id: notifId, userId });
    if (!result) {
      throw new Error('Notification not found or access denied');
    }
    return { message: 'Notification deleted' };
  }

  /**
   * Xóa tất cả thông báo của user.
   */
  async deleteAll(userId) {
    await Notification.deleteMany({ userId });
    return { message: 'All notifications deleted' };
  }
}

module.exports = new NotificationService();
