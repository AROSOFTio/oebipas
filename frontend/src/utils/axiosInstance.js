import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: '/api/v1',
});

// Request interceptor to attach the JWT token
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('oebipas_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle 401s globally
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    const requestUrl = error.config?.url || '';
    const isAuthAttempt = requestUrl.includes('/auth/login') || requestUrl.includes('/auth/forgot-password') || requestUrl.includes('/auth/reset-password');

    if (error.response && error.response.status === 401 && !isAuthAttempt) {
      // Token expired or invalid
      localStorage.removeItem('oebipas_token');
      localStorage.removeItem('oebipas_user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
