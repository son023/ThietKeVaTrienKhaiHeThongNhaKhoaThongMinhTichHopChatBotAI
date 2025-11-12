package com.do_an.paymentservice.dto.response;

import lombok.Data;

@Data
public class InvoiceItemResponseDTO {
    private String id;
    private Integer referenceId;
    private String serviceType;
    private Integer quantity;
    private String description;
    private Double unitPrice;
    private Double itemTotal;
}
