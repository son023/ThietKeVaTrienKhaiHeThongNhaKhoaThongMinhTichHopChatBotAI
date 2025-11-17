package com.do_an.paymentservice.dto.request;

import com.do_an.paymentservice.entity.PaymentMethod;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class CreatePaymentRequestDTO {
    @NotEmpty
    private String invoiceId;
    
    // totalAmount là optional - sẽ được tính từ InvoiceItem nếu không có
    private Double totalAmount;
    
    @NotNull
    private PaymentMethod paymentMethod; // "CASH" hoặc "BANK_TRANSFER"
}
