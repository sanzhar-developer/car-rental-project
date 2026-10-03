import api from './api';
import { ACCESS_TOKEN_KEY, REFRESH_TOKEN_KEY, USER_ID_KEY, USER_ROLE_KEY, USER_EMAIL_KEY } from '../constants/config';

const authService = {
  // Register
  async register(email, password, fullName, phoneNumber) {
    try {
      const response = await api.post('/api/auth/register', {
        email,
        password,
        fullName,
        phoneNumber,
      });
      
      // Token saqlash
      if (response.data.accessToken) {
        localStorage.setItem(ACCESS_TOKEN_KEY, response.data.accessToken);
        if (response.data.refreshToken) {
          localStorage.setItem(REFRESH_TOKEN_KEY, response.data.refreshToken);
        }
        localStorage.setItem(USER_ID_KEY, response.data.userId);
        localStorage.setItem(USER_ROLE_KEY, response.data.role);
        localStorage.setItem(USER_EMAIL_KEY, response.data.email);
      }
      
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Login
  async login(email, password) {
    try {
      const response = await api.post('/api/auth/login', {
        email,
        password,
      });
      
      // Token saqlash
      if (response.data.accessToken) {
        localStorage.setItem(ACCESS_TOKEN_KEY, response.data.accessToken);
        if (response.data.refreshToken) {
          localStorage.setItem(REFRESH_TOKEN_KEY, response.data.refreshToken);
        }
        localStorage.setItem(USER_ID_KEY, response.data.userId);
        localStorage.setItem(USER_ROLE_KEY, response.data.role);
        localStorage.setItem(USER_EMAIL_KEY, response.data.email);
      }
      
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Logout
  async logout() {
    const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);
    if (refreshToken) {
      try {
        await api.post('/api/auth/logout', { refreshToken });
      } catch (error) {
        console.error('Backend logout failed:', error);
      }
    }
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    localStorage.removeItem(USER_ID_KEY);
    localStorage.removeItem(USER_ROLE_KEY);
    localStorage.removeItem(USER_EMAIL_KEY);
  },

  // Check if user is logged in
  isAuthenticated() {
    return !!localStorage.getItem(ACCESS_TOKEN_KEY);
  },

  // Get current user role
  getUserRole() {
    return localStorage.getItem(USER_ROLE_KEY);
  },

  // Check if user is admin
  isAdmin() {
    return localStorage.getItem(USER_ROLE_KEY) === 'ADMIN';
  },
};

export default authService;
