import axiosInstance from './axiosInstance';

const authService = {
  // User registration
  register: async (data) => {
    const response = await axiosInstance.post('/auth/register', data);
    return response.data;
  },

  // User login
  login: async (email, password) => {
    const response = await axiosInstance.post('/auth/login', {
      email,
      password,
    });
    const { accessToken, refreshToken } = response.data.data;
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
    return response.data;
  },

  // Refresh token
  refreshToken: async (refreshToken) => {
    const response = await axiosInstance.post('/auth/refresh-token', {
      refreshToken,
    });
    const { accessToken } = response.data.data;
    localStorage.setItem('accessToken', accessToken);
    return response.data;
  },

  // Logout
  logout: async () => {
    const response = await axiosInstance.post('/auth/logout');
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    return response.data;
  },

  // Change password
  changePassword: async (oldPassword, newPassword) => {
    const response = await axiosInstance.post('/auth/change-password', {
      oldPassword,
      newPassword,
    });
    return response.data;
  },

  // Check if user is authenticated
  isAuthenticated: () => {
    return !!localStorage.getItem('accessToken');
  },

  // Get stored tokens
  getTokens: () => {
    return {
      accessToken: localStorage.getItem('accessToken'),
      refreshToken: localStorage.getItem('refreshToken'),
    };
  },

  // Clear tokens
  clearTokens: () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
  },
};

export default authService;
