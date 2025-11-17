package com.do_an.invoiceservice.dto.request;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class CreateInvoiceItemRequestDTO {
    // ID CÓ THỂ NULL (nếu là item mới)
    private String id; // ID của InvoiceItem đã tồn tại

    private Integer referenceId;
    @NotEmpty
    private String serviceType;
    @NotNull @Min(1)
    private Integer quantity;
    private String description;
    @NotNull
    private Double unitPrice;
}
