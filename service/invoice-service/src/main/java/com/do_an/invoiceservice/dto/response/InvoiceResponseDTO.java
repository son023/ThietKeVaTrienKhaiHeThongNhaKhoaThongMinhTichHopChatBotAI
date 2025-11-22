package com.do_an.invoiceservice.dto.response;

import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Data
public class InvoiceResponseDTO {
    private UUID id;
    private String receptionistId;
    private String appointmentId;
    private Integer totalAmount;
    private String currency;
    private String status;
    private LocalDateTime createAt;

    // Lồng danh sách DTO của Item
    private List<InvoiceItemResponseDTO> items;
}
