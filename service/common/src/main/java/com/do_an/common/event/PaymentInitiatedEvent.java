package com.do_an.common.event;


import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;


@Data
@NoArgsConstructor
@AllArgsConstructor
public class PaymentInitiatedEvent {
    private UUID paymentId;
    private UUID invoiceId;
    //private UUID doctorId; // Để gửi thông báo
}