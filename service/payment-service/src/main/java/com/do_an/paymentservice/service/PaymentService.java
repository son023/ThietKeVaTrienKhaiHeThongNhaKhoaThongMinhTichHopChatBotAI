package com.do_an.paymentservice.service;

import com.do_an.paymentservice.client.InvoiceClient;
import com.do_an.paymentservice.dto.request.CreatePaymentRequestDTO;
import com.do_an.paymentservice.dto.request.UpdatePaymentRequestDTO;
import com.do_an.paymentservice.dto.response.InvoiceItemResponseDTO;
import com.do_an.paymentservice.dto.response.InvoiceResponseDTO;
import com.do_an.paymentservice.dto.response.PaymentResponseDTO;
import com.do_an.paymentservice.entity.Payment;
import com.do_an.paymentservice.entity.PaymentMethod;
import com.do_an.paymentservice.entity.PaymentStatus;
import com.do_an.paymentservice.exception.PaymentNotFoundException;
import com.do_an.paymentservice.mapper.PaymentMapper;
import com.do_an.paymentservice.repository.PaymentRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import vn.payos.PayOS;
import vn.payos.type.CheckoutResponseData;
import vn.payos.type.ItemData;
import vn.payos.type.PaymentData;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class PaymentService {

    private final PaymentRepository paymentRepository;
    private final PayOS payOS;
    private final PaymentMapper paymentMapper;
    private final InvoiceClient invoiceClient;

    @Value("${payos.return-url}")
    private String returnUrl;

    @Value("${payos.cancel-url}")
    private String cancelUrl;

    /**
     * CHỨC NĂNG 1: Khởi tạo Thanh toán (CASH hoặc BANK_TRANSFER)
     * Tính tổng tiền từ InvoiceItem của Invoice
     */
    @Transactional
    public PaymentResponseDTO initiatePayment(CreatePaymentRequestDTO request) {
        log.info("Khởi tạo thanh toán cho Invoice: {}, Phương thức: {}", 
                request.getInvoiceId(), request.getPaymentMethod());

        // Lấy thông tin Invoice từ invoice-service (bao gồm danh sách InvoiceItem)
        InvoiceResponseDTO invoice;
        try {
            invoice = invoiceClient.getInvoiceById(request.getInvoiceId());
            log.info("Đã lấy thông tin Invoice: {}, Status: {}, TotalAmount: {}", 
                    invoice.getId(), invoice.getStatus(), invoice.getTotalAmount());
            
            // Kiểm tra Invoice có items không
            if (invoice.getItems() == null || invoice.getItems().isEmpty()) {
                throw new IllegalStateException("Invoice không có items. Không thể thanh toán.");
            }
            
            // Kiểm tra trạng thái Invoice
            if (!List.of("DRAFT", "PENDING").contains(invoice.getStatus())) {
                throw new IllegalStateException("Không thể thanh toán Invoice với trạng thái: " + invoice.getStatus());
            }
            
            // Tính tổng tiền từ InvoiceItem
            Double calculatedTotalAmount = calculateTotalAmountFromItems(invoice.getItems());
            log.info("Tổng tiền tính từ InvoiceItem: {}", calculatedTotalAmount);
            
            // Nếu client gửi totalAmount, kiểm tra khớp
            if (request.getTotalAmount() != null) {
                if (!request.getTotalAmount().equals(calculatedTotalAmount)) {
                    log.warn("Số tiền từ client ({}) không khớp với tổng tiền tính từ InvoiceItem ({})", 
                            request.getTotalAmount(), calculatedTotalAmount);
                    // Có thể throw exception hoặc chỉ log warning tùy business logic
                    // throw new IllegalArgumentException("Số tiền không khớp với hóa đơn");
                }
            }
            
            // Cập nhật totalAmount từ InvoiceItem vào request
            request.setTotalAmount(calculatedTotalAmount);
            
        } catch (Exception e) {
            log.error("Lỗi khi lấy thông tin Invoice: {}", e.getMessage(), e);
            throw new RuntimeException("Không thể lấy thông tin Invoice: " + e.getMessage(), e);
        }

        if (request.getPaymentMethod() == PaymentMethod.CASH) {
            return handleCashPayment(request, invoice);
        } else {
            return handleBankTransferPayment(request, invoice);
        }
    }

    /**
     * Tính tổng tiền từ danh sách InvoiceItem
     */
    private Double calculateTotalAmountFromItems(List<InvoiceItemResponseDTO> items) {
        if (items == null || items.isEmpty()) {
            throw new IllegalStateException("Invoice không có items để tính tổng tiền");
        }
        
        return items.stream()
                .mapToDouble(item -> {
                    // Sử dụng itemTotal nếu có, nếu không thì tính từ quantity * unitPrice
                    if (item.getItemTotal() != null) {
                        return item.getItemTotal();
                    } else if (item.getQuantity() != null && item.getUnitPrice() != null) {
                        return item.getQuantity() * item.getUnitPrice();
                    } else {
                        log.warn("InvoiceItem {} không có đủ thông tin để tính tổng tiền", item.getId());
                        return 0.0;
                    }
                })
                .sum();
    }

    /**
     * Xử lý thanh toán tiền mặt
     */
    @Transactional
    public PaymentResponseDTO handleCashPayment(CreatePaymentRequestDTO request, InvoiceResponseDTO invoice) {
        log.info("Xử lý thanh toán CASH cho Invoice: {}", request.getInvoiceId());

        Payment payment = Payment.builder()
                .invoiceId(request.getInvoiceId())
                .totalAmount(request.getTotalAmount())
                .paymentMethod(PaymentMethod.CASH)
                .status(PaymentStatus.SUCCESSFUL)
                .paidAt(LocalDateTime.now())
                .description("Thanh toán tiền mặt")
                .build();

        paymentRepository.save(payment);

        // Báo cho Invoice Service - Đánh dấu đã thanh toán
        try {
            InvoiceResponseDTO updatedInvoice = invoiceClient.markAsPaid(request.getInvoiceId());
            log.info("Đã cập nhật Invoice {} thành PAID", request.getInvoiceId());
        } catch (Exception e) {
            log.error("Lỗi khi gọi Invoice Service để đánh dấu đã thanh toán: {}", e.getMessage(), e);
        }

        return paymentMapper.toResponseDto(payment);
    }

    /**
     * Xử lý thanh toán chuyển khoản (payOS)
     * Sử dụng InvoiceItem để tạo ItemData chi tiết cho payOS
     */
    @Transactional
    public PaymentResponseDTO handleBankTransferPayment(CreatePaymentRequestDTO request, InvoiceResponseDTO invoice) {
        log.info("Xử lý thanh toán BANK_TRANSFER cho Invoice: {}", request.getInvoiceId());

        try {
            // Tạo orderCode duy nhất
            Long orderCode = System.currentTimeMillis() / 1000;

            // Tạo danh sách ItemData từ InvoiceItem
            List<ItemData> payosItems = convertInvoiceItemsToPayOSItems(invoice.getItems());
            
            log.info("Đã chuyển đổi {} InvoiceItem thành PayOS ItemData", payosItems.size());

            // Tính tổng tiền từ items
            int totalAmountInt = payosItems.stream()
                    .mapToInt(item -> item.getPrice() * item.getQuantity())
                    .sum();

            // Chuẩn bị dữ liệu thanh toán cho payOS
            LocalDateTime expiredAt = LocalDateTime.now().plusMinutes(10);
            long expiredAtUnix = (System.currentTimeMillis() / 1000) + 600;
            PaymentData paymentData = PaymentData.builder()
                    .orderCode(orderCode)
                    .amount(totalAmountInt)
                    .description("HĐ: " + request.getInvoiceId())
                    .items(payosItems)
                    .returnUrl(returnUrl)
                    .cancelUrl(cancelUrl)
                    .expiredAt(expiredAtUnix) // 10 minute expiry
                    .build();

            // Gọi payOS SDK để tạo link thanh toán
            CheckoutResponseData payosResponse = payOS.createPaymentLink(paymentData);
            log.info("Tạo payment link thành công: {}", payosResponse.getCheckoutUrl());

            // Lưu payment record
            Payment payment = Payment.builder()
                    .invoiceId(request.getInvoiceId())
                    .totalAmount(request.getTotalAmount())
                    .paymentMethod(PaymentMethod.BANK_TRANSFER)
                    .status(PaymentStatus.PENDING)
                    .transactionId(String.valueOf(orderCode))
                    .paymentUrl(payosResponse.getCheckoutUrl())
                    .description("Chờ khách hàng chuyển khoản")
                    .expiredAt(expiredAt)
                    .build();

            paymentRepository.save(payment);

            return paymentMapper.toResponseDto(payment);

        } catch (Exception e) {
            log.error("Lỗi khi tạo link thanh toán payOS: {}", e.getMessage(), e);
            throw new RuntimeException("Lỗi tạo link thanh toán: " + e.getMessage(), e);
        }
    }

    /**
     * Chuyển đổi InvoiceItem thành PayOS ItemData
     */
    private List<ItemData> convertInvoiceItemsToPayOSItems(List<InvoiceItemResponseDTO> invoiceItems) {
        if (invoiceItems == null || invoiceItems.isEmpty()) {
            throw new IllegalStateException("Invoice không có items");
        }
        
        return invoiceItems.stream()
                .map(item -> {
                    // Tính giá từ itemTotal hoặc quantity * unitPrice
                    int itemPrice = item.getUnitPrice().intValue();

                    // Tên item: serviceType hoặc description
                    String itemName = item.getServiceType() != null && !item.getServiceType().isEmpty()
                            ? item.getServiceType()
                            : (item.getDescription() != null ? item.getDescription() : "Dịch vụ y tế");
                    
                    return ItemData.builder()
                            .name(itemName)
                            .quantity(item.getQuantity() != null ? item.getQuantity() : 1)
                            .price(itemPrice)
                            .build();
                })
                .collect(Collectors.toList());
    }

    /**
     * CHỨC NĂNG 2: Xử lý Webhook từ payOS
     */
    @Transactional
    public void handlePayOSWebhook(String transactionId, boolean isSuccess, String bankTransactionId) {
        log.info("Xử lý Webhook từ payOS - Transaction ID: {}, Success: {}", transactionId, isSuccess);

        Payment payment = paymentRepository.findByTransactionId(transactionId)
                .orElseThrow(() -> new PaymentNotFoundException("Không tìm thấy payment với Transaction ID: " + transactionId));

        if (payment.getStatus() == PaymentStatus.PENDING) {
            if (isSuccess) {
                payment.setStatus(PaymentStatus.SUCCESSFUL);
                payment.setPaidAt(LocalDateTime.now());
                
                // Lấy thông tin Invoice để tạo description chi tiết
                try {
                    InvoiceResponseDTO invoice = invoiceClient.getInvoiceById(payment.getInvoiceId());
                    payment.setDescription("Thanh toán qua payOS - Thành công");
                } catch (Exception e) {
                    log.warn("Không thể lấy thông tin Invoice để tạo description: {}", e.getMessage());
                    payment.setDescription("Thanh toán qua payOS - Thành công");
                }

                paymentRepository.save(payment);

                // Báo cho Invoice Service - Đánh dấu đã thanh toán
                try {
                    InvoiceResponseDTO updatedInvoice = invoiceClient.markAsPaid(payment.getInvoiceId());
                    log.info("Đã cập nhật Invoice {} thành PAID", payment.getInvoiceId());
                } catch (Exception e) {
                    log.error("Lỗi khi gọi Invoice Service để đánh dấu đã thanh toán: {}", e.getMessage(), e);
                }

                log.info("Payment {} đã THÀNH CÔNG", transactionId);
            } else {
                payment.setStatus(PaymentStatus.FAILED);
                payment.setDescription("Thanh toán thất bại");
                paymentRepository.save(payment);

                log.warn("Payment {} THẤT BẠI", transactionId);
            }
        } else {
            log.warn("Payment {} đã được xử lý trước đó (Status: {}). Bỏ qua.", transactionId, payment.getStatus());
        }
    }

    /**
     * CHỨC NĂNG 3: Lấy trạng thái thanh toán (Client polling)
     */
    @Transactional(readOnly = true)
    public PaymentResponseDTO getPaymentStatus(String invoiceId) {
        log.debug("Lấy trạng thái thanh toán cho Invoice: {}", invoiceId);

        Payment payment = paymentRepository.findFirstByInvoiceIdOrderByCreateAtDesc(invoiceId)
                .orElseThrow(() -> new PaymentNotFoundException("Không tìm thấy thanh toán cho Invoice: " + invoiceId));

        return paymentMapper.toResponseDto(payment);
    }

    /**
     * Lấy chi tiết payment theo ID
     */
    @Transactional(readOnly = true)
    public PaymentResponseDTO getPaymentById(String paymentId) {
        Payment payment = paymentRepository.findById(UUID.fromString(paymentId))
                .orElseThrow(() -> new PaymentNotFoundException("Không tìm thấy Payment ID: " + paymentId));

        return paymentMapper.toResponseDto(payment);
    }

    /**
     * CHỨC NĂNG 4: Cập nhật Payment
     */
    @Transactional
    public PaymentResponseDTO updatePayment(String paymentId, UpdatePaymentRequestDTO request) {
        log.info("Cập nhật Payment: {}", paymentId);
        
        Payment payment = paymentRepository.findById(UUID.fromString(paymentId))
                .orElseThrow(() -> new PaymentNotFoundException("Không tìm thấy Payment ID: " + paymentId));
        
        // Kiểm tra nếu payment đã thành công thì không cho phép cập nhật một số trường
        if (payment.getStatus() == PaymentStatus.SUCCESSFUL && request.getStatus() != null) {
            log.warn("Không thể thay đổi trạng thái của payment đã thành công");
            throw new IllegalStateException("Không thể thay đổi trạng thái của payment đã thành công");
        }
        
        // Cập nhật các trường
        if (request.getTotalAmount() != null) {
            // Nếu cập nhật totalAmount, validate với Invoice
            try {
                InvoiceResponseDTO invoice = invoiceClient.getInvoiceById(payment.getInvoiceId());
                Double calculatedTotal = calculateTotalAmountFromItems(invoice.getItems());
                if (!request.getTotalAmount().equals(calculatedTotal)) {
                    log.warn("Số tiền cập nhật ({}) không khớp với tổng tiền InvoiceItem ({})", 
                            request.getTotalAmount(), calculatedTotal);
                }
            } catch (Exception e) {
                log.warn("Không thể validate totalAmount với Invoice: {}", e.getMessage());
            }
            payment.setTotalAmount(request.getTotalAmount());
        }
        
        if (request.getStatus() != null) {
            payment.setStatus(request.getStatus());
            if (request.getStatus() == PaymentStatus.SUCCESSFUL && payment.getPaidAt() == null) {
                payment.setPaidAt(LocalDateTime.now());
                
                // Cập nhật Invoice nếu payment thành công
                try {
                    invoiceClient.markAsPaid(payment.getInvoiceId());
                    log.info("Đã cập nhật Invoice {} thành PAID", payment.getInvoiceId());
                } catch (Exception e) {
                    log.error("Lỗi khi gọi Invoice Service: {}", e.getMessage(), e);
                }
            }
        }
        
        if (request.getDescription() != null && !request.getDescription().isEmpty()) {
            payment.setDescription(request.getDescription());
        }
        
        paymentRepository.save(payment);
        
        log.info("Đã cập nhật Payment: {}", paymentId);
        return paymentMapper.toResponseDto(payment);
    }

    /**
     * CHỨC NĂNG 5: Xóa Payment
     */
    @Transactional
    public void deletePayment(String paymentId) {
        log.info("Xóa Payment: {}", paymentId);
        
        Payment payment = paymentRepository.findById(UUID.fromString(paymentId))
                .orElseThrow(() -> new PaymentNotFoundException("Không tìm thấy Payment ID: " + paymentId));
        
        // Kiểm tra nếu payment đã thành công thì không cho phép xóa
        if (payment.getStatus() == PaymentStatus.SUCCESSFUL) {
            log.warn("Không thể xóa payment đã thành công");
            throw new IllegalStateException("Không thể xóa payment đã thành công");
        }
        
        paymentRepository.delete(payment);
        log.info("Đã xóa Payment: {}", paymentId);
    }

    /**
     * CHỨC NĂNG 6: Lấy danh sách Payments với lọc (không phân trang)
     */
    @Transactional(readOnly = true)
    public List<PaymentResponseDTO> getAllPayments(
            String invoiceId,
            PaymentStatus status,
            PaymentMethod paymentMethod) {
        
        log.debug("Lấy danh sách payments với filters - InvoiceId: {}, Status: {}, Method: {}", 
                invoiceId, status, paymentMethod);
        
        List<Payment> payments;
        
        // Xử lý các trường hợp filter khác nhau
        if (invoiceId != null && status != null && paymentMethod != null) {
            payments = paymentRepository.findAllByInvoiceIdAndStatusAndPaymentMethod(
                    invoiceId, status, paymentMethod);
        } else if (invoiceId != null && status != null) {
            payments = paymentRepository.findAllByInvoiceIdAndStatus(invoiceId, status);
        } else if (invoiceId != null && paymentMethod != null) {
            payments = paymentRepository.findAllByInvoiceIdAndPaymentMethod(invoiceId, paymentMethod);
        } else if (status != null && paymentMethod != null) {
            payments = paymentRepository.findAllByStatusAndPaymentMethod(status, paymentMethod);
        } else if (invoiceId != null) {
            payments = paymentRepository.findAllByInvoiceId(invoiceId);
        } else if (status != null) {
            payments = paymentRepository.findAllByStatus(status);
        } else if (paymentMethod != null) {
            payments = paymentRepository.findAllByPaymentMethod(paymentMethod);
        } else {
            payments = paymentRepository.findAllByOrderByCreateAtDesc();
        }
        
        return payments.stream()
                .map(paymentMapper::toResponseDto)
                .collect(Collectors.toList());
    }

    /**
     * CHỨC NĂNG 7: Lấy tất cả payments theo Invoice ID
     */
    @Transactional(readOnly = true)
    public List<PaymentResponseDTO> getPaymentsByInvoiceId(String invoiceId) {
        log.debug("Lấy tất cả payments cho Invoice: {}", invoiceId);
        
        List<Payment> payments = paymentRepository.findAllByInvoiceId(invoiceId);
        
        return payments.stream()
                .map(paymentMapper::toResponseDto)
                .collect(Collectors.toList());
    }
    
    /**
     * CHỨC NĂNG 8: Kiểm tra Invoice tồn tại và hợp lệ
     */
    @Transactional(readOnly = true)
    public InvoiceResponseDTO validateInvoice(String invoiceId) {
        log.debug("Kiểm tra Invoice: {}", invoiceId);
        
        try {
            InvoiceResponseDTO invoice = invoiceClient.getInvoiceById(invoiceId);
            
            // Kiểm tra Invoice có items không
            if (invoice.getItems() == null || invoice.getItems().isEmpty()) {
                throw new IllegalStateException("Invoice không có items");
            }
            
            // Tính tổng tiền từ items
            Double calculatedTotal = calculateTotalAmountFromItems(invoice.getItems());
            log.info("Invoice hợp lệ: {} - Status: {} - TotalAmount (tính từ items): {}", 
                    invoice.getId(), invoice.getStatus(), calculatedTotal);
            
            return invoice;
        } catch (Exception e) {
            log.error("Lỗi khi kiểm tra Invoice: {}", e.getMessage(), e);
            throw new RuntimeException("Không thể lấy thông tin Invoice: " + e.getMessage(), e);
        }
    }
}

