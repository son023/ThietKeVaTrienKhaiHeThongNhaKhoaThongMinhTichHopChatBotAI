package com.main_project.notification_service.handler;


import com.do_an.common.event.InvoicePaidNotificationEvent;
import com.main_project.notification_service.service.WebSocketNotificationService;
import lombok.extern.slf4j.Slf4j;
import org.axonframework.eventhandling.EventHandler;
import org.springframework.stereotype.Component;

@Component
@Slf4j
public class InvoicePaidEventHandler {

    private final WebSocketNotificationService webSocketNotificationService;

    public InvoicePaidEventHandler(WebSocketNotificationService webSocketNotificationService) {
        this.webSocketNotificationService = webSocketNotificationService;
    }

    @EventHandler
    public void on(InvoicePaidNotificationEvent event) {
        log.info("Received InvoicePaidNotificationEvent for invoice {} appointment={}",
                event.getInvoiceId(), event.getAppointmentId());

        try {

            webSocketNotificationService.sendInvoicePaidNotification(
                    event.getInvoiceId(),
                    event.getAppointmentId(),
                    event.getMessage()
            );
        } catch (Exception e) {
            log.error("Failed to send websocket notification for invoice paid {}",
                    event.getInvoiceId(), e);
        }
    }
}
