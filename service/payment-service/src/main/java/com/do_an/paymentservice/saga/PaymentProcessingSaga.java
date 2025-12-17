package com.do_an.paymentservice.saga;



import com.do_an.common.command.*;
import com.do_an.common.event.InvoiceCancelledEvent;
import com.do_an.common.event.PaymentFailedEvent;
import com.do_an.common.event.PaymentInitiatedEvent;
import com.do_an.common.event.PaymentProcessedEvent;
import com.do_an.paymentservice.client.InventoryClient;
import com.do_an.paymentservice.dto.response.DispenseOrderResponse;
import com.do_an.paymentservice.entity.PaymentStatus;
import lombok.extern.slf4j.Slf4j;
import org.axonframework.commandhandling.gateway.CommandGateway;
import org.axonframework.deadline.DeadlineManager;
import org.axonframework.deadline.annotation.DeadlineHandler;
import org.axonframework.eventhandling.EventHandler;
import org.axonframework.modelling.saga.EndSaga;
import org.axonframework.modelling.saga.SagaEventHandler;
import org.axonframework.modelling.saga.SagaLifecycle;
import org.axonframework.modelling.saga.StartSaga;
import org.axonframework.spring.stereotype.Saga;
import org.springframework.beans.factory.annotation.Autowired;

import java.time.Duration;
import java.util.UUID;

@Saga
@Slf4j
public class PaymentProcessingSaga {

    @Autowired
    private transient CommandGateway commandGateway;

    @Autowired
    private transient DeadlineManager deadlineManager;

    private UUID paymentId;
    private UUID invoiceId;
    private String deadlineId;
    
    // ✅ Track command sending để đảm bảo idempotency
    private boolean invoicePaidCommandSent = false;
    private boolean invoiceCancelCommandSent = false;

    @StartSaga
    @SagaEventHandler(associationProperty = "paymentId")
    public void on(PaymentInitiatedEvent event) {
        log.info("🔵 [SAGA START] PaymentInitiatedEvent: paymentId={}, invoiceId={}", 
                event.getPaymentId(), event.getInvoiceId());
        
        // ✅ Idempotency check
        if (this.paymentId != null) {
            log.warn("⚠️ PaymentInitiatedEvent already processed for paymentId={}, skipping...", 
                    event.getPaymentId());
            return;
        }

        this.paymentId = event.getPaymentId();
        this.invoiceId = event.getInvoiceId();

        // Timeout 30 phút cho mã QR
        this.deadlineId = deadlineManager.schedule(
                Duration.ofMinutes(30),
                "paymentSessionTimeout", 
                this.paymentId
        );
        
        log.info("⏰ Đã thiết lập timeout 30 phút cho payment session: {}", paymentId);
    }

    @EndSaga
    @SagaEventHandler(associationProperty = "paymentId")
    public void on(PaymentProcessedEvent event) {
        log.info("✅ [SAGA SUCCESS] PaymentProcessedEvent: paymentId={}, invoiceId={}", 
                event.getPaymentId(), event.getInvoiceId());

        cancelDeadline();
        
        // ✅ Idempotency check: Chỉ gửi command một lần
        if (!invoicePaidCommandSent) {
            invoicePaidCommandSent = true;
            
            log.info("📤 Sending MarkInvoiceAsPaidCommand for invoice {}", event.getInvoiceId());
            commandGateway.send(new MarkInvoiceAsPaidCommand(event.getInvoiceId()))
                .exceptionally(exception -> {
                    log.error("❌ Lỗi kỹ thuật khi mark invoice as paid: {}", exception.getMessage());
                    invoicePaidCommandSent = false; // Reset để có thể retry
                    return null;
                });
        } else {
            log.warn("⚠️ MarkInvoiceAsPaidCommand already sent for invoice {}, skipping...", 
                    event.getInvoiceId());
        }

        // TODO: Gửi lệnh sang Inventory để đổi trạng thái từ RESERVED -> SOLD
        // commandGateway.send(new ConfirmMedicineDispenseCommand());
        
        log.info("🎉 Payment Saga completed successfully for payment {}", event.getPaymentId());
    }

    @EndSaga
    @SagaEventHandler(associationProperty = "paymentId")
    public void on(PaymentFailedEvent event) {
        log.warn("❌ [SAGA FAILED] PaymentFailedEvent: paymentId={}, status={}, reason={}", 
                event.getPaymentId(), event.getStatus(), event.getReason());

        if ("TIMEOUT".equals(event.getStatus())) {
            log.info("⏰ Giao dịch TIMEOUT. Thực hiện Hủy Hóa Đơn và Trả Thuốc.");
            this.deadlineId = null;
            
            // ✅ Idempotency check: Chỉ gửi command một lần
            if (!invoiceCancelCommandSent) {
                invoiceCancelCommandSent = true;
                
                log.info("📤 Sending CancelInvoiceCommand for invoice {} due to timeout", this.invoiceId);
                commandGateway.send(new CancelInvoiceCommand(
                        this.invoiceId,
                        "Hủy do hết hạn thanh toán (Timeout 30 phút)"
                )).exceptionally(exception -> {
                    log.error("❌ Lỗi kỹ thuật khi cancel invoice: {}", exception.getMessage());
                    invoiceCancelCommandSent = false; // Reset để có thể retry
                    return null;
                });
            } else {
                log.warn("⚠️ CancelInvoiceCommand already sent for invoice {}, skipping...", 
                        this.invoiceId);
            }

        } else if ("CANCELLED".equals(event.getStatus())) {
            log.info("🚫 Người dùng đã hủy thanh toán. Giữ nguyên hóa đơn để có thể thanh toán lại.");
            cancelDeadline();
            
        } else {
            log.info("⚠️ Giao dịch thất bại do: {}. Giữ nguyên Hóa đơn để thử lại.", event.getReason());
            cancelDeadline();
        }

        // TODO: Thông báo Frontend qua Notification Service
        log.info("💬 Payment failed notification should be sent to frontend");
    }

    
    @DeadlineHandler(deadlineName = "paymentSessionTimeout")
    public void onTimeout() {
        log.warn("⏰ [SAGA TIMEOUT] Payment session timeout sau 30 phút: paymentId={}", paymentId);
        
        // ✅ Gửi command để update payment status sang TIMEOUT
        log.info("📤 Sending UpdatePaymentStatusCommand to mark payment as TIMEOUT");
        commandGateway.send(new UpdatePaymentStatusCommand(
                paymentId,
                PaymentStatus.TIMEOUT.toString(),
                "Thanh toán timeout - Hết hạn mã QR sau 30 phút"
        )).exceptionally(exception -> {
            log.error("❌ Lỗi khi update payment status to TIMEOUT: {}", exception.getMessage());
            return null;
        });
    }

    private void cancelDeadline() {
        if (deadlineId != null) {
            try {
                log.info("🔕 Cancelling deadline: {}", deadlineId);
                deadlineManager.cancelSchedule("paymentSessionTimeout", deadlineId);
                log.info("✅ Deadline cancelled successfully");
            } catch (Exception e) {
                log.debug("ℹ️ Deadline {} đã không còn tồn tại để hủy (có thể đã timeout rồi)", deadlineId);
            }
            deadlineId = null;
        }
    }

    
}
