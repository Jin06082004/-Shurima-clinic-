import axiosInstance from './axiosInstance';

const userService = {
  // Get all users with pagination and filters
  getAllUsers: async (page = 1, limit = 10, filters = {}) => {
    const params = new URLSearchParams({
      page,
      limit,
      ...filters,
    });
    const response = await axiosInstance.get(`/users?${params}`);
    const payload = response.data;
    return {
      ...payload,
      data: payload.data?.users || [],
      pagination: payload.data?.pagination,
    };
  },

  // Get user by ID
  getUserById: async (id) => {
    const response = await axiosInstance.get(`/users/${id}`);
    return response.data;
  },

  // Get current user profile
  getProfile: async () => {
    const response = await axiosInstance.get('/users/profile/me');
    return response.data;
  },

  // Create new user (admin only)
  createUser: async (data) => {
    const response = await axiosInstance.post('/users', data);
    return response.data;
  },

  // Update user
  updateUser: async (id, data) => {
    const response = await axiosInstance.put(`/users/${id}`, data);
    return response.data;
  },

  // Update current user profile
  updateProfile: async (data) => {
    const response = await axiosInstance.put('/users/profile/me', data);
    return response.data;
  },

  // Delete user (admin only)
  deleteUser: async (id) => {
    const response = await axiosInstance.delete(`/users/${id}`);
    return response.data;
  },

  // Deactivate user
  deactivateUser: async (id) => {
    const response = await axiosInstance.patch(`/users/${id}/deactivate`);
    return response.data;
  },

  // Activate user
  activateUser: async (id) => {
    const response = await axiosInstance.patch(`/users/${id}/activate`);
    return response.data;
  },
};

export default userService;
