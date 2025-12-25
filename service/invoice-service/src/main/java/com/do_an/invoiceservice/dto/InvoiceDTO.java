package com.do_an.invoiceservice.dto;

import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Data
public class InvoiceDTO {
    private UUID id;
    private UUID receptionistId;
    private UUID appointmentId;
    private Integer totalAmount;
    private String currency;
    private String status;
    private LocalDateTime issueAt;
    private LocalDateTime paidAt;
    private Integer insuranceTotalPay;
    private Integer patientTotalPay;
    private UUID insuranceClaimId;
    private LocalDateTime updateAt;
    private List<InvoiceItemDTO> items;
}

