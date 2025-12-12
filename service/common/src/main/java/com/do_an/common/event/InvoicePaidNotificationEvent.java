package com.do_an.common.event;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class InvoicePaidNotificationEvent {
    private UUID invoiceId;
    private UUID appointmentId;
    private String message;
}