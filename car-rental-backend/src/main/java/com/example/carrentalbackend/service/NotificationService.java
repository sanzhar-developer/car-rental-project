package com.example.carrentalbackend.service;

import com.example.carrentalbackend.websocket.NotificationMessage;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

@Service
public class NotificationService {

    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    public void sendNotificationToUser(Long userId, String type, String message, Object data) {
        NotificationMessage notification = new NotificationMessage(type, message, userId, data);
        messagingTemplate.convertAndSend("/topic/user/" + userId, notification);
    }

    public void sendGlobalNotification(String type, String message, Object data) {
        NotificationMessage notification = new NotificationMessage(type, message, null, data);
        messagingTemplate.convertAndSend("/topic/notifications", notification);
    }
}
