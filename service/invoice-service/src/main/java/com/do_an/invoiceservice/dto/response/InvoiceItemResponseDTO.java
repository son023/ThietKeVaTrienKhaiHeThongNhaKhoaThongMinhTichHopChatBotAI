package com.do_an.invoiceservice.dto.response;

import lombok.Data;

@Data
public class InvoiceItemResponseDTO {
    private String id;
    private Integer referenceId;
    private String serviceType;
    private Integer quantity;
    private String description;
    private Double unitPrice;

    // Chúng ta có thể thêm một trường tính toán
    private Double itemTotal;
}
