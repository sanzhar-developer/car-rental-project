import { create } from 'zustand';

const useNotificationStore = create((set) => ({
  notifications: [],

  addNotification: (notification) => {
    set((state) => ({
      notifications: [
        {
          id: Date.now(),
          timestamp: new Date().toISOString(),
          ...notification,
        },
        ...state.notifications,
      ],
    }));
  },

  removeNotification: (id) => {
    set((state) => ({
      notifications: state.notifications.filter((n) => n.id !== id),
    }));
  },

  clearNotifications: () => {
    set({ notifications: [] });
  },

  markAsRead: (id) => {
    set((state) => ({
      notifications: state.notifications.map((n) =>
        n.id === id ? { ...n, read: true } : n
      ),
    }));
  },

  getUnreadCount: () => {
    return useNotificationStore.getState().notifications.filter((n) => !n.read).length;
  },
}));

export default useNotificationStore;
