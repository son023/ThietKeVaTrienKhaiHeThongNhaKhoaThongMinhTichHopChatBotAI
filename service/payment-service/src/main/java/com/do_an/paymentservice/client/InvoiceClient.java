package com.do_an.paymentservice.client;

import com.do_an.paymentservice.dto.response.InvoiceResponseDTO;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;

@FeignClient(
    name = "invoice-service",
    url = "${invoice.service.url:http://localhost:8086}" // URL của invoice-service
)
public interface InvoiceClient {
    
    /**
     * Lấy thông tin Invoice theo ID
     * GET /api/invoices/{id}
     */
    @GetMapping("/api/invoices/{id}")
    InvoiceResponseDTO getInvoiceById(@PathVariable("id") String invoiceId);
    
    /**
     * Đánh dấu Invoice đã thanh toán
     * PATCH /api/invoices/{id}/pay
     */
    @PatchMapping("/api/invoices/{id}/pay")
    InvoiceResponseDTO markAsPaid(@PathVariable("id") String invoiceId);
    
    /**
     * Hủy Invoice
     * PATCH /api/invoices/{id}/cancel
     */
    @PatchMapping("/api/invoices/{id}/cancel")
    InvoiceResponseDTO cancelInvoice(@PathVariable("id") String invoiceId);
}
