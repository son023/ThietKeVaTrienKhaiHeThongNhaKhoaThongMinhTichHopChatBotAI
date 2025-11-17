package com.do_an.invoiceservice.dto.request;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.util.List;

@Data
public class CreateInvoiceRequestDTO {
    // Cho phép cập nhật các trường "header" này
    @NotEmpty
    private String receptionistId;
    @NotEmpty
    private String appointmentId;
    @NotEmpty
    private String currency;

    // Danh sách "ĐẦY ĐỦ" các item mà hóa đơn NÊN CÓ
    @Valid
    @NotEmpty
    @Size(min = 1)
    private List<CreateInvoiceItemRequestDTO> items; // Cập nhật type
}
