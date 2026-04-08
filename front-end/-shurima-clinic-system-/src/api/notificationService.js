import axiosInstance from './axiosInstance';

const notificationService = {
  /**
   * Lấy danh sách thông báo của user hiện tại.
   * @param {number} page
   * @param {number} limit
   */
  getMyNotifications: async (page = 1, limit = 20) => {
    const response = await axiosInstance.get(
      `/notifications?page=${page}&limit=${limit}`
    );
    return response.data;
  },

  /**
   * Lấy số thông báo chưa đọc.
   */
  getUnreadCount: async () => {
    const response = await axiosInstance.get('/notifications/unread-count');
    return response.data;
  },

  /**
   * Đánh dấu một thông báo là đã đọc.
   * @param {string} id - notification _id
   */
  markAsRead: async (id) => {
    const response = await axiosInstance.patch(`/notifications/${id}/read`);
    return response.data;
  },

  /**
   * Đánh dấu TẤT CẢ thông báo là đã đọc.
   */
  markAllAsRead: async () => {
    const response = await axiosInstance.post('/notifications/mark-all-read');
    return response.data;
  },

  /**
   * Xóa một thông báo.
   * @param {string} id - notification _id
   */
  deleteNotification: async (id) => {
    const response = await axiosInstance.delete(`/notifications/${id}`);
    return response.data;
  },

  /**
   * Xóa tất cả thông báo.
   */
  deleteAll: async () => {
    const response = await axiosInstance.delete('/notifications');
    return response.data;
  },
};

export default notificationService;
