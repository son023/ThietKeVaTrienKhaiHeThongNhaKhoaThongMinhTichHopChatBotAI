package com.main_project.notification_service.controller;

import com.do_an.common.event.InvoicePaidNotificationEvent;
import com.main_project.notification_service.service.WebSocketNotificationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.axonframework.eventhandling.EventBus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

import static org.axonframework.eventhandling.GenericEventMessage.asEventMessage;

@RestController
@RequestMapping("/notification-service")
@RequiredArgsConstructor
@Slf4j
public class NotificationController {

    private final EventBus eventBus;
    private final WebSocketNotificationService webSocketNotificationService;

    /**
     * API giả lập để phát InvoicePaidNotificationEvent
     * Dùng để test WebSocket notification cho Pharmacist
     *
     * POST /notification-service/test/invoice-paid
     * Body:
     * {
     *   "invoiceId": "uuid",
     *   "appointmentId": "uuid",
     *   "message": "Hóa đơn đã được thanh toán thành công"
     * }
     */
    @PostMapping("/test/invoice-paid")
    public ResponseEntity<Map<String, Object>> simulateInvoicePaid(
            @RequestBody(required = false) InvoicePaidRequest request) {

        log.info("🔔 [TEST API] Simulating InvoicePaidNotificationEvent");


        // Tạo event
        InvoicePaidNotificationEvent event = new InvoicePaidNotificationEvent(
                UUID.fromString(request.getInvoiceId()),
                UUID.fromString(request.getAppointmentId()),
                "Hóa đơn " + request.getInvoiceId() + " đã được thanh toán thành công. Có thể cấp phát đơn thuốc."
        );

        // Phát event qua Axon EventBus
        eventBus.publish(asEventMessage(event));

        log.info("✅ [TEST API] InvoicePaidNotificationEvent published: invoiceId={}, appointmentId={}",
                request.getInvoiceId(), request.getAppointmentId());

        // Trả về response
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", "InvoicePaidNotificationEvent đã được phát thành công");

        return ResponseEntity.ok(response);
    }

    /**
     * API giả lập đơn giản hơn - chỉ cần invoiceId
     * GET /notification-service/test/invoice-paid?invoiceId=xxx&appointmentId=xxx
     */
    @GetMapping("/test/invoice-paid")
    public ResponseEntity<Map<String, Object>> simulateInvoicePaidSimple(
            @RequestParam(required = false) String invoiceId,
            @RequestParam(required = false) String appointmentId,
            @RequestParam(required = false, defaultValue = "Hóa đơn đã được thanh toán thành công. Có thể cấp phát đơn thuốc.") String message) {

        log.info("🔔 [TEST API] Simulating InvoicePaidNotificationEvent (GET)");

        UUID invId = invoiceId != null ? UUID.fromString(invoiceId) : UUID.randomUUID();
        UUID appId = appointmentId != null ? UUID.fromString(appointmentId) : UUID.randomUUID();

        InvoicePaidNotificationEvent event = new InvoicePaidNotificationEvent(
                invId,
                appId,
                message
        );

        eventBus.publish(asEventMessage(event));

        log.info("✅ [TEST API] InvoicePaidNotificationEvent published: invoiceId={}, appointmentId={}",
                invId, appId);

        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", "InvoicePaidNotificationEvent đã được phát thành công");
        response.put("invoiceId", invId.toString());
        response.put("appointmentId", appId.toString());
        response.put("eventMessage", message);

        return ResponseEntity.ok(response);
    }

    /**
     * DTO cho request body
     */
    public static class InvoicePaidRequest {
        private String invoiceId;
        private String appointmentId;
        private String message;

        public String getInvoiceId() {
            return invoiceId;
        }

        public void setInvoiceId(String invoiceId) {
            this.invoiceId = invoiceId;
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