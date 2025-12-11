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

    public void sendLabTestCompletedNotification(UUID doctorId, UUID labTestId, UUID appointmentId, String message) {
        log.info("=== Sending lab test completed notification ===");
        log.info("Doctor ID: {}, LabTest ID: {}, Appointment ID: {}", 
                doctorId, labTestId, appointmentId);
        log.info("Message: {}", message);
        
        LabTestCompletedNotificationMessage notificationMessage = new LabTestCompletedNotificationMessage(
            "LAB_TEST_COMPLETED",
            labTestId.toString(),
            appointmentId.toString(),
            message
        );

        String topic = "/topic/notifications/" + doctorId.toString();
        log.info("Sending to topic: {}", topic);
        log.info("Notification message object: type={}, labTestId={}, appointmentId={}, message={}", 
                notificationMessage.getType(), 
                notificationMessage.getLabTestId(), 
                notificationMessage.getAppointmentId(), 
                notificationMessage.getMessage());
        
        try {
            messagingTemplate.convertAndSend(topic, notificationMessage);
            log.info("Lab test completed notification sent successfully to topic {} for doctor {}", topic, doctorId);
        } catch (Exception e) {
            log.error("Failed to send websocket notification to topic {}: {}", topic, e.getMessage(), e);
            throw e;
        }
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

    public static class LabTestCompletedNotificationMessage {
        private String type;
        private String labTestId;
        private String appointmentId;
        private String message;

        public LabTestCompletedNotificationMessage(String type, String labTestId, String appointmentId, String message) {
            this.type = type;
            this.labTestId = labTestId;
            this.appointmentId = appointmentId;
            this.message = message;
        }

        public String getType() {
            return type;
        }

        public void setType(String type) {
            this.type = type;
        }

        public String getLabTestId() {
            return labTestId;
        }

        public void setLabTestId(String labTestId) {
            this.labTestId = labTestId;
        }

        public String getAppointmentId() {
            return appointmentId;
        }

        public void setAppointmentId(String appointmentId) {
            this.appointmentId = appointmentId;
        }

        public String getMessage() {
            return message;
        }

        public void setMessage(String message) {
            this.message = message;
        }
    }
}