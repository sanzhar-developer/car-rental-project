import axios from 'axios';
import { API_BASE_URL, ACCESS_TOKEN_KEY, REFRESH_TOKEN_KEY, USER_ID_KEY, USER_ROLE_KEY } from '../constants/config';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem(ACCESS_TOKEN_KEY);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    console.group(' API ERROR');
    console.error('URL:', originalRequest?.url);
    console.error('Method:', originalRequest?.method?.toUpperCase());
    console.error('Status:', error.response?.status || 'Network Error');
    console.error('Data:', error.response?.data);
    console.groupEnd();

    if (error.response?.status === 401 && originalRequest.url !== '/api/auth/refresh' && !originalRequest._retry) {
      originalRequest._retry = true;
      const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);

      if (refreshToken) {
        try {
          const refreshResponse = await axios.post(`${API_BASE_URL}/api/auth/refresh`, {
            refreshToken
          });
          
          if (refreshResponse.data.accessToken) {
            localStorage.setItem(ACCESS_TOKEN_KEY, refreshResponse.data.accessToken);
            if (refreshResponse.data.refreshToken) {
              localStorage.setItem(REFRESH_TOKEN_KEY, refreshResponse.data.refreshToken);
            }
            originalRequest.headers.Authorization = `Bearer ${refreshResponse.data.accessToken}`;
            return api(originalRequest);
          }
        } catch (refreshError) {
          console.error('Token refresh failed:', refreshError);
        }
      }

      localStorage.removeItem(ACCESS_TOKEN_KEY);
      localStorage.removeItem(REFRESH_TOKEN_KEY);
      localStorage.removeItem(USER_ID_KEY);
      localStorage.removeItem(USER_ROLE_KEY);
      window.location.href = '/login';
    }

    return Promise.reject(error);
  }
);

export default api;


