package com.do_an.common.event;

import lombok.Value;

@Value
public class PreInvoiceCreatedEvent { // Kích hoạt Bước 3
    String invoiceId;
    String appointmentId;
}