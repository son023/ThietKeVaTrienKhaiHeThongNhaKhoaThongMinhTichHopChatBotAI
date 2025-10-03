package com.main_project.notification_service.controller;

import com.main_project.notification_service.dto.TicketSummaryRequest;
import com.main_project.notification_service.service.NotificationService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/notification")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class NotificationController {

    NotificationService notificationService;

    @PostMapping("/payment-success")
    ResponseEntity<Map<String, String>> sendPaymentSuccessEmail(
            @RequestBody TicketSummaryRequest ticketSummaryRequest) {
        System.out.println("Got hrer");
        notificationService.sendPaymentSuccessEmail(ticketSummaryRequest);
        return ResponseEntity.ok(null);
    }
}