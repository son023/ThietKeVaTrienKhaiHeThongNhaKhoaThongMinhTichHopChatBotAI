package com.main_project.notification_service.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
@Slf4j
public class WebSocketNotificationService {

    private final SimpMessagingTemplate messagingTemplate;

    public WebSocketNotificationService(SimpMessagingTemplate messagingTemplate) {
        this.messagingTemplate = messagingTemplate;
    }

    public void sendAppointmentRollbackNotification(UUID appointmentId, String reason) {
        log.info("Sending appointment rollback notification for appointment {} reason={}", appointmentId, reason);
        
        NotificationMessage message = new NotificationMessage(
            "APPOINTMENT_ROLLBACK",
            appointmentId.toString(),
            reason,
            "Bắt đầu khám thất bại. Vui lòng quay lại trang lịch hẹn."
        );

        String topic = "/topic/appointment-rollback/" + appointmentId.toString();
        messagingTemplate.convertAndSend(topic, message);
        log.info("Appointment rollback notification sent to topic {} for appointment {}", topic, appointmentId);
    }

    public static class NotificationMessage {
        private String type;
        private String appointmentId;
        private String reason;
        private String message;

        public NotificationMessage(String type, String appointmentId, String reason, String message) {
            this.type = type;
            this.appointmentId = appointmentId;
            this.reason = reason;
            this.message = message;
        }

        public String getType() {
            return type;
        }

        public void setType(String type) {
            this.type = type;
        }

        public String getAppointmentId() {
            return appointmentId;
        }

        public void setAppointmentId(String appointmentId) {
            this.appointmentId = appointmentId;
        }

        public String getReason() {
            return reason;
        }

        public void setReason(String reason) {
            this.reason = reason;
        }

        public String getMessage() {
            return message;
        }

        public void setMessage(String message) {
            this.message = message;
        }
    }
}