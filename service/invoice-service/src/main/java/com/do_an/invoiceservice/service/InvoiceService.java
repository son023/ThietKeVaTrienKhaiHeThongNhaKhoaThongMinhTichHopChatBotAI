package com.do_an.invoiceservice.service;

import com.do_an.invoiceservice.dto.InvoiceDTO;
import com.do_an.invoiceservice.dto.InvoiceItemDTO;
import com.do_an.invoiceservice.repository.InvoiceRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class InvoiceService {

    private final InvoiceRepository invoiceRepository;


    @Transactional
    public InvoiceDTO create(InvoiceDTO invoice) {
        // Tạo Invoice mới với thông tin từ request
        // Kiểm tra thông tin Invoice hợp lệ
        // Lưu Invoice vào database
        // Trả về Invoice đã tạo
    }

    @Transactional
    public InvoiceDTO update(InvoiceDTO invoice) {
        // Tìm Invoice theo ID
        // Nếu không tìm thấy, ném ra ngoại lệ
        // Cập nhật thông tin Invoice
        // Lưu Invoice đã cập nhật vào database
        // Trả về Invoice đã cập nhật
    }

    @Transactional
    public void deleteItem(List<InvoiceItemDTO> items) {
        // Xóa các InvoiceItem theo danh sách
        // Kiểm tra InvoiceItem có tồn tại không
        // Xóa InvoiceItem khỏi database
    }

    @Transactional(readOnly = true)
    public InvoiceDTO getInvoice(UUID invoiceId) {
        // Tìm Invoice theo ID
        // Nếu không tìm thấy, ném ra ngoại lệ
        // Trả về Invoice
    }

    @Transactional
    public Boolean markAsPaid(UUID invoiceId) {
        // Tìm Invoice theo ID
        // Nếu không tìm thấy, ném ra ngoại lệ
        // Kiểm tra trạng thái Invoice có thể đánh dấu đã thanh toán không
        // Cập nhật trạng thái Invoice thành PAID
        // Lưu Invoice đã cập nhật vào database
        // Trả về kết quả
    }
}