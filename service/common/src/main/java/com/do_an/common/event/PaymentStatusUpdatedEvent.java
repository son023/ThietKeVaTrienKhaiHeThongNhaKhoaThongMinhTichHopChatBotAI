package com.do_an.common.event;


import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PaymentStatusUpdatedEvent {
    private UUID paymentId;
    private UUID invoiceId;
    private String status; // Lưu dưới dạng String để tránh phụ thuộc Enum của service con
    private String reason;
}
