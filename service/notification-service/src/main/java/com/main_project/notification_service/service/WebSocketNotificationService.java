package com.main_project.notification_service.service;

import com.main_project.notification_service.dto.NotificationMessage;
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

    public void sendInvoicePaidNotification(UUID invoiceId, UUID appointmentId, String message) {
        log.info("Sending invoice paid notification for invoice {} appointment={}", invoiceId, appointmentId);

        // Tạo notification message mở rộng
        NotificationMessage notification = NotificationMessage.builder()
                 .type("INVOICE_PAID")
            .appointmentId(appointmentId != null ? appointmentId.toString() : null)
            .invoiceId(invoiceId.toString())
            .reason(invoiceId.toString()) // Dùng reason để chứa invoiceId (backward compatible)
            .message(message != null ? message : "Hóa đơn đã được thanh toán thành công. Có thể cấp phát đơn thuốc.")
            .timestamp(System.currentTimeMillis())
            .build();

        // Gửi tới topic chung cho tất cả pharmacists
        String topic = "/topic/invoice-paid";
        messagingTemplate.convertAndSend(topic, notification);

        log.info("Invoice paid notification sent to topic {} for invoice {}", topic, invoiceId);
    }


}