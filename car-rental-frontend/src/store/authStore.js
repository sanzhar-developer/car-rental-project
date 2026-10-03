import { create } from 'zustand';
import { ACCESS_TOKEN_KEY, REFRESH_TOKEN_KEY, USER_ID_KEY, USER_ROLE_KEY, USER_EMAIL_KEY } from '../constants/config';
import authService from '../services/authService';

const useAuthStore = create((set) => ({
  user: localStorage.getItem(ACCESS_TOKEN_KEY) ? {
    id: localStorage.getItem(USER_ID_KEY),
    email: localStorage.getItem(USER_EMAIL_KEY),
    role: localStorage.getItem(USER_ROLE_KEY),
  } : null,
  token: localStorage.getItem(ACCESS_TOKEN_KEY) || null,
  isAuthenticated: !!localStorage.getItem(ACCESS_TOKEN_KEY),

  login: (authData) => {
    localStorage.setItem(ACCESS_TOKEN_KEY, authData.accessToken);
    if (authData.refreshToken) {
      localStorage.setItem(REFRESH_TOKEN_KEY, authData.refreshToken);
    }
    localStorage.setItem(USER_ID_KEY, authData.userId);
    localStorage.setItem(USER_ROLE_KEY, authData.role);
    localStorage.setItem(USER_EMAIL_KEY, authData.email);

    set({
      user: {
        id: authData.userId,
        email: authData.email,
        role: authData.role,
        fullName: authData.fullName,
      },
      token: authData.accessToken,
      isAuthenticated: true,
    });
  },


  logout: async () => {
    await authService.logout();
    set({
      user: null,
      token: null,
      isAuthenticated: false,
    });
  },

  updateUser: (userData) => {
    set((state) => ({
      user: { ...state.user, ...userData },
    }));
  },
}));

export default useAuthStore;
