import { useEffect } from 'react';
import useAuthStore from '../store/authStore';
import useNotificationStore from '../store/notificationStore';
import websocketService from '../services/websocket';
import toast from 'react-hot-toast';

const useWebSocket = () => {
  const { user } = useAuthStore();
  const { addNotification } = useNotificationStore();

  useEffect(() => {
    if (user?.id) {
      websocketService
        .connect(user.id, (notification) => {
          // Add to notification store
          addNotification(notification);

          // Show toast notification (Kazakh Localization)
          const notificationMessages = {
            BOOKING_CONFIRMED: 'Тапсырысыңыз расталды',
            BOOKING_CANCELLED: 'Тапсырыс бас тартылды',
            PENALTY_APPLIED: 'Кешіктіргеніңіз үшін айыппұл салынды',
            BOOKING_RESCHEDULED: 'Тапсырыс уақыты өзгертілді',
            PAYMENT_RECEIVED: 'Төлем қабылданды',
            PENALTY_PAID: 'Айыппұл төленді',
          };

          const message = notificationMessages[notification.type] || notification.message;
          toast.success(message);
        })
        .catch((error) => {
          console.error('WebSocket connection error:', error);
        });

      return () => {
        try {
          websocketService.disconnect();
        } catch (error) {
          console.error('WebSocket disconnect error:', error);
        }
      };
    }
  }, [user, addNotification]);

  return websocketService;
};

export default useWebSocket;
