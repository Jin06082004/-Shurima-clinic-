import axiosInstance from './axiosInstance';

const adminService = {
  // Get all admins
  getAllAdmins: async (page = 1, limit = 10) => {
    const params = new URLSearchParams({
      page,
      limit,
    });
    const response = await axiosInstance.get(`/admin?${params}`);
    return response.data;
  },

  // Get admin by ID
  getAdminById: async (id) => {
    const response = await axiosInstance.get(`/admin/${id}`);
    return response.data;
  },

  // Create admin
  createAdmin: async (data) => {
    const response = await axiosInstance.post('/admin', data);
    return response.data;
  },

  // Update admin
  updateAdmin: async (id, data) => {
    const response = await axiosInstance.put(`/admin/${id}`, data);
    return response.data;
  },

  // Delete admin
  deleteAdmin: async (id) => {
    const response = await axiosInstance.delete(`/admin/${id}`);
    return response.data;
  },

  // Grant permission
  grantPermission: async (id, permission) => {
    const response = await axiosInstance.post(`/admin/${id}/grant-permission`, {
      permission,
    });
    return response.data;
  },

  // Revoke permission
  revokePermission: async (id, permission) => {
    const response = await axiosInstance.post(`/admin/${id}/revoke-permission`, {
      permission,
    });
    return response.data;
  },

  // Get activity log
  getActivityLog: async (id) => {
    const response = await axiosInstance.get(`/admin/${id}/activity-log`);
    return response.data;
  },
};

export default adminService;
