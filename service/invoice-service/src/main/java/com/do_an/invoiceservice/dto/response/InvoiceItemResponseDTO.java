package com.do_an.invoiceservice.dto.response;

import lombok.Data;

import java.util.UUID;

@Data
public class InvoiceItemResponseDTO {
    private UUID id;
    private Integer referenceId;
    private String serviceType;
    private Integer quantity;
    private String description;
    private Integer unitPrice;

    // Chúng ta có thể thêm một trường tính toán
    private Integer itemTotal;
}
