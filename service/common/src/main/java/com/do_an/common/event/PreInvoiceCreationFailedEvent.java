package com.do_an.common.event;

import lombok.Data;
import lombok.Value;

@Value
public class PreInvoiceCreationFailedEvent { // Kích hoạt Rollback 1
    String invoiceId;
    String appointmentId;
}