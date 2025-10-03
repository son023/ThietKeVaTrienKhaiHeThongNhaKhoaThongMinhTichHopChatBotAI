package com.main_project.notification_service.configuration;

import com.main_project.notification_service.dto.TicketSummaryRequest;
import com.main_project.notification_service.service.EmailService;
import com.main_project.notification_service.service.NotificationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Service;

@Service
@Slf4j
@RequiredArgsConstructor
public class PaymentNotificationConsumer {

    private final NotificationService notificationService; // Service hiện tại để gửi email

    @KafkaListener(topics = KafkaConfig.TICKET_SUMARY_TOPIC,
            containerFactory = "kafkaListenerContainerFactory",
            groupId = "notification-service-group")
    public void handlePaymentNotification(TicketSummaryRequest ticketSummaryResponse) {

        try {
//            // Gọi service hiện tại để gửi email
            notificationService.sendPaymentSuccessEmail(ticketSummaryResponse);
            log.info("Đã gửi email thông báo thanh toán thành công");
        } catch (Exception e) {
            log.error("Lỗi khi gửi email thông báo: {}", e.getMessage(), e);
        }
    }
}