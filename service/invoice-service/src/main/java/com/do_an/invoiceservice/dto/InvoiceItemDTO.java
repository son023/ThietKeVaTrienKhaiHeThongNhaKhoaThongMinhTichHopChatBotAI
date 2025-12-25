package com.do_an.invoiceservice.dto;

import lombok.Data;

import java.util.UUID;

@Data
public class InvoiceItemDTO {
    private UUID id;
    private UUID referenceId;
    private String serviceType;
    private Integer quantity;
    private String description;
    private Integer unitPrice;
    private Integer insurancePayAmount;
    private Integer patientPayAmount;
    private UUID claimItemId;
}

