package com.do_an.invoiceservice.service;

import com.do_an.invoiceservice.dto.request.CreateInvoiceItemRequestDTO;
import com.do_an.invoiceservice.dto.request.CreateInvoiceRequestDTO;
import com.do_an.invoiceservice.dto.response.InvoiceResponseDTO;
import com.do_an.invoiceservice.entity.Invoice;
import com.do_an.invoiceservice.entity.InvoiceItem;
import com.do_an.invoiceservice.exception.InvoiceNotFoundException;
import com.do_an.invoiceservice.mapper.InvoiceItemMapper;
import com.do_an.invoiceservice.mapper.InvoiceMapper;
import com.do_an.invoiceservice.repository.InvoiceItemRepository;
import com.do_an.invoiceservice.repository.InvoiceRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class InvoiceService {

    private final InvoiceRepository invoiceRepository;
    private final InvoiceItemRepository invoiceItemRepository; // <-- INJECT MỚI
    private final InvoiceMapper invoiceMapper; // <-- INJECT MỚI
    private final InvoiceItemMapper invoiceItemMapper; // <-- INJECT MỚI


    /**
     * CHỨC NĂNG 1: Tạo Hóa đơn mới (Transaction)
     */
    @Transactional
    public InvoiceResponseDTO createInvoice(CreateInvoiceRequestDTO request) {
        Invoice invoice = invoiceMapper.toEntity(request);
        String invoiceId = "invoice-" + (System.currentTimeMillis() % 10000000000L); // chỉ lấy 10 chữ số cuối
        invoice.setId(invoiceId);

        invoice.setStatus("DRAFT"); // <-- THAY ĐỔI: Bắt đầu là DRAFT
        invoice.setIssueAt(LocalDateTime.now()); // Vẫn set ngày tạo

        double totalAmount = 0.0;
        for (InvoiceItem item : invoice.getItems()) {
            item.setId(UUID.randomUUID().toString());
            item.setInvoice(invoice);
            totalAmount += (item.getQuantity() * item.getUnitPrice());
        }
        invoice.setTotalAmount(totalAmount);
        Invoice savedInvoice = invoiceRepository.save(invoice);
        savedInvoice.getItems().size(); // ép load các item
        return invoiceMapper.toResponseDto(savedInvoice);
    }

    /**
     * HÀM MỚI: Cập nhật Hóa đơn (chỉ khi là DRAFT)
     */
    @Transactional
    public InvoiceResponseDTO updateInvoice(String invoiceId, CreateInvoiceRequestDTO request) {
        Invoice invoice = invoiceRepository.findById(invoiceId)
                .orElseThrow(() -> new InvoiceNotFoundException("Không tìm thấy hóa đơn"));

        // Chỉ cho phép sửa khi là DRAFT
        if (!"DRAFT".equals(invoice.getStatus())) {
            throw new IllegalStateException("Chỉ các hóa đơn DRAFT mới có thể được cập nhật.");
        }

        // 1. Cập nhật header
        invoice.setReceptionistId(request.getReceptionistId());
        invoice.setAppointmentId(request.getAppointmentId());
        invoice.setCurrency(request.getCurrency());

        // 2. Đồng bộ hóa Items (logic phức tạp)
        syncInvoiceItems(invoice, request.getItems());

        // 3. Tính toán lại tổng tiền
        double newTotalAmount = invoice.getItems().stream()
                .mapToDouble(item -> item.getQuantity() * item.getUnitPrice())
                .sum();
        invoice.setTotalAmount(newTotalAmount);

        Invoice savedInvoice = invoiceRepository.save(invoice);
        return invoiceMapper.toResponseDto(savedInvoice);
    }

    /**
     * HÀM HELPER: Đồng bộ (Thêm/Sửa/Xóa) các items
     */
    private void syncInvoiceItems(Invoice invoice, List<CreateInvoiceItemRequestDTO> dtos) {
        // 1. Lấy Map các item DTO có ID (để cập nhật)
        Map<String, CreateInvoiceItemRequestDTO> dtoMap = dtos.stream()
                .filter(dto -> dto.getId() != null)
                .collect(Collectors.toMap(CreateInvoiceItemRequestDTO::getId, Function.identity()));

        // 2. Xử lý XÓA
        List<InvoiceItem> existingItems = invoiceItemRepository.findByInvoiceId(invoice.getId());
        List<InvoiceItem> itemsToRemove = existingItems.stream()
                .filter(existing -> !dtoMap.containsKey(existing.getId()))
                .collect(Collectors.toList());

        invoice.getItems().removeAll(itemsToRemove); // Xóa khỏi collection
        invoiceItemRepository.deleteAll(itemsToRemove); // Xóa khỏi DB

        // 3. Xử lý THÊM / SỬA
        for (CreateInvoiceItemRequestDTO dto : dtos) {
            if (dto.getId() == null) {
                // THÊM MỚI
                InvoiceItem newItem = invoiceItemMapper.toEntity(dto); // Dùng mapper
                newItem.setId(UUID.randomUUID().toString());
                invoice.addItem(newItem); // Thêm vào collection (để Cascade lưu)
            } else {
                // CẬP NHẬT
                InvoiceItem existingItem = existingItems.stream()
                        .filter(item -> item.getId().equals(dto.getId()))
                        .findFirst()
                        .orElse(null);

                if (existingItem != null) {
                    // Dùng mapper để cập nhật (an toàn)
                    invoiceItemMapper.updateFromDto(dto, existingItem);
                }
            }
        }
    }

    /**
     * HÀM MỚI: "Chốt" hóa đơn, chuyển từ DRAFT -> ISSUED
     */
    @Transactional
    public InvoiceResponseDTO finalizeInvoice(String invoiceId) {
        Invoice invoice = invoiceRepository.findById(invoiceId)
                .orElseThrow(() -> new InvoiceNotFoundException("Không tìm thấy hóa đơn"));

        if (!"DRAFT".equals(invoice.getStatus())) {
            throw new IllegalStateException("Chỉ các hóa đơn DRAFT mới có thể được hoàn tất.");
        }
        invoice.setStatus("PENDING");
        Invoice savedInvoice = invoiceRepository.save(invoice);
        return invoiceMapper.toResponseDto(savedInvoice);
    }

    /**
     * CHỨC NĂNG 2: Đánh dấu Đã thanh toán
     */
    @Transactional
    public InvoiceResponseDTO markAsPaid(String invoiceId) {
        Invoice invoice = invoiceRepository.findById(invoiceId)
                .orElseThrow(() -> new InvoiceNotFoundException("Không tìm thấy hoá đơn"));

        if (!"PENDING".equals(invoice.getStatus())) {
            throw new IllegalStateException("Chỉ hóa đơn PENDING mới có thể được đánh dấu là PAID.");
        }

        invoice.setStatus("PAID");
        invoice.setPaidAt(LocalDateTime.now());

        Invoice savedInvoice = invoiceRepository.save(invoice);

        return invoiceMapper.toResponseDto(savedInvoice);
    }

    /**
     * CHỨC NĂNG 3: Hủy Hóa đơn
     */
    @Transactional
    public InvoiceResponseDTO cancelInvoice(String invoiceId) {
        Invoice invoice = invoiceRepository.findById(invoiceId)
                .orElseThrow(() -> new InvoiceNotFoundException("Không tìm thấy hoá đơn"));

        if (!List.of("DRAFT", "PENDING").contains(invoice.getStatus())) { // <-- Sửa
            throw new IllegalStateException("Chỉ hoá đơn DRAFT hoặc PENDING có thể CANCELLED.");
        }
        invoice.setStatus("CANCELLED");
        Invoice savedInvoice = invoiceRepository.save(invoice);
        return invoiceMapper.toResponseDto(savedInvoice);
    }

    /**
     * CHỨC NĂNG 4: Lấy Hóa đơn theo ID
     */
    @Transactional(readOnly = true)
    public InvoiceResponseDTO getInvoiceById(String invoiceId) {
        // Cần join fetch items để lấy luôn
        Invoice invoice = invoiceRepository.findById(invoiceId)
                .orElseThrow(() -> new InvoiceNotFoundException("Không tìm thấy hoá đơn"));

        // Nạp (load) các items
        invoice.getItems().size(); // Thủ thuật để Hibernate load lazy collection
        return invoiceMapper.toResponseDto(invoice);
    }

    /**
     * CHỨC NĂNG 5: Lọc Hóa đơn
     */
    @Transactional(readOnly = true)
    public List<InvoiceResponseDTO> listInvoices(String status) {
        if (status != null && !status.isEmpty()) {
            return invoiceMapper.toResponseDtoList(invoiceRepository.findAllByStatus(status));
        }
        return invoiceMapper.toResponseDtoList(invoiceRepository.findAll());
    }
}