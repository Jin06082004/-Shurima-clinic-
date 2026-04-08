import axios from 'axios';

// Create axios instance with base URL pointing to backend
const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5001/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

console.log('🌐 Axios - Base URL:', axiosInstance.defaults.baseURL);

// Add request interceptor to include JWT token
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    console.log(`📤 Axios Request - [${config.method?.toUpperCase()}] ${config.url}`, {
      hasToken: !!token,
      tokenLength: token ? token.length : 0,
    });
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    } else {
      console.warn('⚠️ Axios - No token found in localStorage');
    }
    return config;
  },
  (error) => {
    console.error('❌ Axios - Request error:', error);
    return Promise.reject(error);
  }
);

// Add response interceptor to handle token refresh
axiosInstance.interceptors.response.use(
  (response) => {
    console.log(`✅ Axios Response - [${response.status}] ${response.config.url}`, {
      success: response.data.success,
      hasData: !!response.data.data,
    });
    return response;
  },
  async (error) => {
    console.error(`❌ Axios Error - [${error.response?.status}] ${error.config?.url}`, {
      message: error.response?.data?.message,
      data: error.response?.data,
    });
    
    const originalRequest = error.config;
    const backendError = error.response?.data?.error;

    if (error.response?.status === 401 && backendError === 'invalid signature') {
      console.warn('⚠️ Axios - Invalid token signature. Clearing auth state...');
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
      window.location.href = '/login';
      return Promise.reject(error);
    }

    // If error is 401 and we haven't retried yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      console.log('🔄 Axios - 401 detected, attempting token refresh...');
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (refreshToken) {
          console.log('📝 Axios - Refresh token found, sending refresh request...');
          const response = await axiosInstance.post('/auth/refresh-token', {
            refreshToken,
          });

          const { accessToken } = response.data.data;
          console.log('✅ Axios - New token received, retrying original request...');
          localStorage.setItem('accessToken', accessToken);

          // Retry original request with new token
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          return axiosInstance(originalRequest);
        } else {
          console.warn('⚠️ Axios - No refresh token found');
        }
      } catch (refreshError) {
        console.error('❌ Axios - Token refresh failed:', refreshError.message);
        // Clear tokens and redirect to login if refresh fails
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;

