package com.do_an.invoiceservice.controller;

import com.do_an.invoiceservice.dto.InvoiceDTO;
import com.do_an.invoiceservice.dto.InvoiceItemDTO;
import com.do_an.invoiceservice.service.InvoiceService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/invoice-service/invoices")
@RequiredArgsConstructor
public class InvoiceController {

    private final InvoiceService invoiceService;

    @PostMapping
    public InvoiceDTO create(@RequestBody InvoiceDTO invoice) {
        // Nhận request tạo Invoice
        // Gọi service để tạo Invoice
        // Trả về response với Invoice đã tạo
    }

    @PutMapping
    public InvoiceDTO update(@RequestBody InvoiceDTO invoice) {
        // Nhận request cập nhật Invoice
        // Gọi service để cập nhật Invoice
        // Trả về response với Invoice đã cập nhật
    }

    @DeleteMapping("/items")
    public void deleteItem(@RequestBody List<InvoiceItemDTO> items) {
        // Nhận request xóa InvoiceItem
        // Gọi service để xóa InvoiceItem
    }

    @GetMapping("/{invoiceId}")
    public InvoiceDTO getInvoice(@PathVariable UUID invoiceId) {
        // Nhận request lấy Invoice theo ID
        // Gọi service để lấy Invoice
        // Trả về response với Invoice
    }

    @PatchMapping("/{invoiceId}/pay")
    public Boolean markAsPaid(@PathVariable UUID invoiceId) {
        // Nhận request đánh dấu Invoice đã thanh toán
        // Gọi service để đánh dấu Invoice đã thanh toán
        // Trả về response với kết quả
    }
}
