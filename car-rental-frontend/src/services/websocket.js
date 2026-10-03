import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { WS_BASE_URL, ACCESS_TOKEN_KEY } from '../constants/config';

class WebSocketService {
  constructor() {
    this.client = null;
    this.connected = false;
  }

  connect(userId, onMessageCallback) {
    const token = localStorage.getItem(ACCESS_TOKEN_KEY);

    return new Promise((resolve, reject) => {
      this.client = new Client({
        webSocketFactory: () => new SockJS(WS_BASE_URL),
        connectHeaders: {
          Authorization: `Bearer ${token}`,
        },
        debug: (str) => {
          console.log('STOMP: ' + str);
        },
        reconnectDelay: 5000,
        heartbeatIncoming: 4000,
        heartbeatOutgoing: 4000,
      });

      this.client.onConnect = (frame) => {
        console.log('Connected: ' + frame);
        this.connected = true;

        // Subscribe to user-specific notifications
        this.client.subscribe(`/topic/user/${userId}`, (message) => {
          const notification = JSON.parse(message.body);
          onMessageCallback(notification);
        });

        // Subscribe to global notifications
        this.client.subscribe('/topic/notifications', (message) => {
          const notification = JSON.parse(message.body);
          onMessageCallback(notification);
        });

        resolve();
      };

      this.client.onStompError = (frame) => {
        console.error('Broker reported error: ' + frame.headers['message']);
        console.error('Additional details: ' + frame.body);
        reject(frame);
      };

      this.client.activate();
    });
  }

  disconnect() {
    if (this.client) {
      this.client.deactivate();
      this.connected = false;
      console.log('Disconnected');
    }
  }

  isConnected() {
    return this.connected;
  }
}

export default new WebSocketService();

