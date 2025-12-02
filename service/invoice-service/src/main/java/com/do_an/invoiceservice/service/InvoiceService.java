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
    private final InvoiceItemRepository invoiceItemRepository;
    private final InvoiceMapper invoiceMapper;
    private final InvoiceItemMapper invoiceItemMapper;

    /**
     * Tạo hóa đơn mới (Transaction)
     */
    @Transactional
    public InvoiceResponseDTO createInvoice(CreateInvoiceRequestDTO request) {
        Invoice invoice = invoiceMapper.toEntity(request);
        // ID sẽ do JPA sinh (UUID)
        invoice.setStatus("DRAFT");
        invoice.setIssueAt(LocalDateTime.now());

        double totalAmount = 0.0;
        for (InvoiceItem item : invoice.getItems()) {
            invoice.addItem(item); // đồng bộ 2 chiều
            totalAmount += (item.getQuantity() * item.getUnitPrice());
        }
        invoice.setTotalAmount(totalAmount);
        Invoice savedInvoice = invoiceRepository.save(invoice);
        savedInvoice.getItems().size(); // ensure lazy loaded
        return invoiceMapper.toResponseDto(savedInvoice);
    }

    /**
     * Cập nhật hóa đơn (chỉ khi DRAFT)
     */
    @Transactional
    public InvoiceResponseDTO updateInvoice(String invoiceId, CreateInvoiceRequestDTO request) {
        Invoice invoice = invoiceRepository.findById(UUID.fromString(invoiceId))
                .orElseThrow(() -> new InvoiceNotFoundException("Không tìm thấy hóa đơn"));

        if (!"DRAFT".equals(invoice.getStatus())) {
            throw new IllegalStateException("Chỉ các hóa đơn DRAFT mới có thể được cập nhật.");
        }

        // 1. Header
        invoice.setReceptionistId(request.getReceptionistId());
        invoice.setAppointmentId(request.getAppointmentId());
        invoice.setCurrency(request.getCurrency());

        // 2. Đồng bộ items
        syncInvoiceItems(invoice, request.getItems());

        // 3. Tính lại tổng
        double newTotalAmount = invoice.getItems().stream()
                .mapToDouble(item -> item.getQuantity() * item.getUnitPrice())
                .sum();
        invoice.setTotalAmount(newTotalAmount);

        Invoice savedInvoice = invoiceRepository.save(invoice);
        return invoiceMapper.toResponseDto(savedInvoice);
    }

    /**
     * Đồng bộ (thêm/sửa/xóa) items
     */
    private void syncInvoiceItems(Invoice invoice, List<CreateInvoiceItemRequestDTO> dtos) {
        Map<UUID, CreateInvoiceItemRequestDTO> dtoMap = dtos.stream()
                .filter(dto -> dto.getId() != null)
                .collect(Collectors.toMap(dto -> UUID.fromString(dto.getId()), Function.identity()));

        List<InvoiceItem> existingItems = invoiceItemRepository.findByInvoiceId(invoice.getId());
        List<InvoiceItem> itemsToRemove = existingItems.stream()
                .filter(existing -> !dtoMap.containsKey(existing.getId()))
                .collect(Collectors.toList());

        invoice.getItems().removeAll(itemsToRemove);
        invoiceItemRepository.deleteAll(itemsToRemove);

        for (CreateInvoiceItemRequestDTO dto : dtos) {
            if (dto.getId() == null) {
                // Thêm mới
                InvoiceItem newItem = invoiceItemMapper.toEntity(dto);
                invoice.addItem(newItem);
            } else {
                // Cập nhật
                InvoiceItem existingItem = existingItems.stream()
                        .filter(item -> item.getId().equals(UUID.fromString(dto.getId())))
                        .findFirst()
                        .orElse(null);
                if (existingItem != null) {
                    invoiceItemMapper.updateFromDto(dto, existingItem);
                }
            }
        }
    }

    /**
     * Chốt hóa đơn (DRAFT -> PENDING)
     */
    @Transactional
    public InvoiceResponseDTO finalizeInvoice(String invoiceId) {
        Invoice invoice = invoiceRepository.findById(UUID.fromString(invoiceId))
                .orElseThrow(() -> new InvoiceNotFoundException("Không tìm thấy hóa đơn"));

        if (!"DRAFT".equals(invoice.getStatus())) {
            throw new IllegalStateException("Chỉ các hóa đơn DRAFT mới có thể được hoàn tất.");
        }
        invoice.setStatus("PENDING");
        Invoice savedInvoice = invoiceRepository.save(invoice);
        return invoiceMapper.toResponseDto(savedInvoice);
    }

    /**
     * Đánh dấu đã thanh toán
     */
    @Transactional
    public InvoiceResponseDTO markAsPaid(String invoiceId) {
        Invoice invoice = invoiceRepository.findById(UUID.fromString(invoiceId))
                .orElseThrow(() -> new InvoiceNotFoundException("Không tìm thấy hóa đơn"));

        if (!"PENDING".equals(invoice.getStatus())) {
            throw new IllegalStateException("Chỉ hóa đơn PENDING mới có thể được đánh dấu là PAID.");
        }

        invoice.setStatus("PAID");
        invoice.setPaidAt(LocalDateTime.now());

        Invoice savedInvoice = invoiceRepository.save(invoice);

        return invoiceMapper.toResponseDto(savedInvoice);
    }

    /**
     * Hủy hóa đơn
     */
    @Transactional
    public InvoiceResponseDTO cancelInvoice(String invoiceId) {
        Invoice invoice = invoiceRepository.findById(UUID.fromString(invoiceId))
                .orElseThrow(() -> new InvoiceNotFoundException("Không tìm thấy hóa đơn"));

        if (!List.of("DRAFT", "PENDING").contains(invoice.getStatus())) {
            throw new IllegalStateException("Chỉ hóa đơn DRAFT hoặc PENDING có thể CANCELLED.");
        }
        invoice.setStatus("CANCELLED");
        Invoice savedInvoice = invoiceRepository.save(invoice);
        return invoiceMapper.toResponseDto(savedInvoice);
    }

    /**
     * Lấy hóa đơn theo ID
     */
    @Transactional(readOnly = true)
    public InvoiceResponseDTO getInvoiceById(String invoiceId) {
        Invoice invoice = invoiceRepository.findById(UUID.fromString(invoiceId))
                .orElseThrow(() -> new InvoiceNotFoundException("Không tìm thấy hóa đơn"));

        invoice.getItems().size();
        return invoiceMapper.toResponseDto(invoice);
    }

    /**
     * Lọc hóa đơn
     */
    @Transactional(readOnly = true)
    public List<InvoiceResponseDTO> listInvoices(String status) {
        if (status != null && !status.isEmpty()) {
            return invoiceMapper.toResponseDtoList(invoiceRepository.findAllByStatus(status));
        }
        return invoiceMapper.toResponseDtoList(invoiceRepository.findAll());
    }
}
