package com.do_an.invoiceservice.dto.response;

import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

@Data
public class InvoiceResponseDTO {
    private String id;
    private String receptionistId;
    private String appointmentId;
    private Double totalAmount;
    private String currency;
    private String status;
    private LocalDateTime issueAt;
    private LocalDateTime paidAt;
    private LocalDateTime createAt; // Thêm createAt để client biết

    // Lồng danh sách DTO của Item
    private List<InvoiceItemResponseDTO> items;
}
