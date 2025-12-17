package com.do_an.paymentservice.aggregate;


import com.do_an.common.command.CancelInsuranceClaimCommand;
import com.do_an.common.command.ReleaseMedicineReservationCommand;
import com.do_an.common.event.*;
import com.do_an.paymentservice.client.InventoryClient;
import com.do_an.paymentservice.dto.response.DispenseOrderResponse;
import com.do_an.paymentservice.entity.Payment;
import com.do_an.paymentservice.entity.PaymentStatus;
import com.do_an.paymentservice.repository.PaymentRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.axonframework.commandhandling.gateway.CommandGateway;
import org.axonframework.eventhandling.EventBus;
import org.axonframework.eventhandling.EventHandler;
import org.axonframework.eventhandling.GenericEventMessage;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.UUID;

@Component
@RequiredArgsConstructor
@Slf4j
public class PaymentEventHandler {
    private final PaymentRepository paymentRepository;
    private final EventBus eventBus;
    private final CommandGateway commandGateway;
    private final InventoryClient inventoryClient;


    @EventHandler
    @Transactional
    public void on(PaymentStatusUpdatedEvent event){
        log.info("💳 [PAYMENT] Processing PaymentStatusUpdatedEvent: paymentId={}, newStatus={}", 
                event.getPaymentId(), event.getStatus());

        UUID paymentId = event.getPaymentId();
        PaymentStatus newStatus = PaymentStatus.valueOf(event.getStatus());
        String reason = event.getReason();

        try {
            Payment payment = paymentRepository.findById(paymentId)
                    .orElseThrow(() -> new RuntimeException(
                            "Không tìm thấy PaymentId: " + paymentId
                    ));

            // ✅ IDEMPOTENCY CHECK: Kiểm tra nếu đã ở trạng thái cuối cùng
            if (payment.getStatus() == PaymentStatus.SUCCESSFUL) {
                log.warn("⚠️ Payment {} đã SUCCESSFUL, bỏ qua cập nhật sang {}", 
                        paymentId, newStatus);
                return;
            }

            // ✅ IDEMPOTENCY CHECK: Kiểm tra nếu đã ở trạng thái mong muốn
            if (payment.getStatus() == newStatus) {
                log.warn("⚠️ Payment {} đã ở trạng thái {}, bỏ qua cập nhật trùng lặp", 
                        paymentId, newStatus);
                
                // Vẫn publish event nếu cần (để Saga nhận)
                publishDownstreamEvent(event, newStatus);
                return;
            }

            // Cập nhật database
            PaymentStatus oldStatus = payment.getStatus();
            payment.setStatus(newStatus);
            if (newStatus == PaymentStatus.SUCCESSFUL) {
                payment.setPaidAt(LocalDateTime.now());
            }
            payment.setDescription(reason);
            paymentRepository.save(payment);

            log.info("✅ Đã cập nhật DB: Payment {} từ {} sang {}", paymentId, oldStatus, newStatus);

            // Publish downstream events
            publishDownstreamEvent(event, newStatus);

        } catch (Exception e) {
            log.error("❌ Lỗi khi cập nhật thanh toán {}: {}", paymentId, e.getMessage(), e);
            throw new RuntimeException("Failed to update payment status", e);
        }
    }

    // ✅ HELPER: Publish downstream events dựa trên status
    private void publishDownstreamEvent(PaymentStatusUpdatedEvent event, PaymentStatus status) {
        // Nếu thành công -> Phát PaymentProcessedEvent để Saga chốt đơn
        if (status == PaymentStatus.SUCCESSFUL) {
            log.info("📤 Publishing PaymentProcessedEvent for payment {}", event.getPaymentId());
            eventBus.publish(GenericEventMessage.asEventMessage(
                    new PaymentProcessedEvent(
                            event.getPaymentId(),
                            event.getInvoiceId()
                    )
            ));
        } 
        // Nếu thất bại/hủy/timeout -> Phát PaymentFailedEvent
        else if (status == PaymentStatus.FAILED ||
                 status == PaymentStatus.CANCELLED ||
                 status == PaymentStatus.TIMEOUT) {
            log.info("📤 Publishing PaymentFailedEvent for payment {} with status {}", 
                    event.getPaymentId(), status);
            eventBus.publish(GenericEventMessage.asEventMessage(
                    new PaymentFailedEvent(
                            event.getPaymentId(),
                            event.getStatus(),
                            event.getReason()
                    )
            ));
        }
    }

    @EventHandler
    public void on(InvoiceCancelledEvent event) {
        log.info("📋 [PAYMENT] Processing InvoiceCancelledEvent: invoiceId={}, prescriptionId={}", 
                event.getInvoiceId(), event.getPrescriptionId());

        try {
            // ✅ Lấy DispenseOrder từ Inventory
            DispenseOrderResponse dispenseOrderResponse = inventoryClient.getByPrescriptionId(event.getPrescriptionId());
            
            if (dispenseOrderResponse == null) {
                log.warn("⚠️ Không tìm thấy DispenseOrder cho prescriptionId: {}", event.getPrescriptionId());
                return;
            }
            
            UUID dispenseOrderId = dispenseOrderResponse.getId();
            log.info("✅ Found DispenseOrder {} for prescription {}", dispenseOrderId, event.getPrescriptionId());

            // ✅ Cập nhật Inventory: Chuyển DispenseOrder sang CANCELLED và trả lại số lượng
            log.info("📤 Sending ReleaseMedicineReservationCommand for dispenseOrder {}", dispenseOrderId);
            commandGateway.send(new ReleaseMedicineReservationCommand(
                    dispenseOrderId,
                    event.getPrescriptionId()
            )).exceptionally(exception -> {
                log.error("❌ Lỗi khi release medicine reservation: {}", exception.getMessage());
                return null;
            });

            // ✅ Cập nhật Insurance: Chuyển Claim sang CANCELLED (nếu có)
            if (event.getInsuranceClaimId() != null) {
                log.info("📤 Sending CancelInsuranceClaimCommand for claim {}", event.getInsuranceClaimId());
                commandGateway.send(new CancelInsuranceClaimCommand(
                        event.getInsuranceClaimId(),
                        event.getPrescriptionId(),
                        event.getReason()
                )).exceptionally(exception -> {
                    log.error("❌ Lỗi khi cancel insurance claim: {}", exception.getMessage());
                    return null;
                });
            } else {
                log.info("ℹ️ No insurance claim to cancel for prescription {}", event.getPrescriptionId());
            }

            log.info("✅ Đã đồng bộ trạng thái CANCELLED cho các service liên quan");

        } catch (Exception e) {
            log.error("❌ Lỗi khi xử lý InvoiceCancelledEvent cho invoice {}: {}", 
                    event.getInvoiceId(), e.getMessage(), e);
        }
    }


}
