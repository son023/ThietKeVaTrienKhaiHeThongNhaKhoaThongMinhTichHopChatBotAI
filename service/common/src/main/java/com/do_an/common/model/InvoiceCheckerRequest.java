package com.do_an.common.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.Set;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class InvoiceCheckerRequest {

    private UUID id;
    private UUID patientId;
    private UUID receptionistId;
    private UUID appointmentId;

    private Integer totalAmount;
    private String currency;
    private String status;

    private LocalDateTime issueAt;
    private LocalDateTime paidAt;
    private LocalDateTime updateAt;

    private Set<InvoiceItemCheckerRequest> items;
}
