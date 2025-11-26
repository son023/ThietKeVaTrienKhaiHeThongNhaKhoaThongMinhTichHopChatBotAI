package com.do_an.common.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;


@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class InvoiceItemResponse {

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
