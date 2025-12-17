package com.do_an.paymentservice.aggregate;




import com.do_an.common.command.CreatePaymentCommand;
import com.do_an.common.command.UpdatePaymentStatusCommand;
import com.do_an.common.event.PaymentFailedEvent;
import com.do_an.common.event.PaymentInitiatedEvent;
import com.do_an.common.event.PaymentProcessedEvent;
import com.do_an.common.event.PaymentStatusUpdatedEvent;
import com.do_an.paymentservice.entity.PaymentStatus;
import com.do_an.paymentservice.repository.PaymentRepository;
import lombok.NoArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.axonframework.commandhandling.CommandHandler;
import org.axonframework.eventsourcing.EventSourcingHandler;
import org.axonframework.modelling.command.AggregateIdentifier;
import org.axonframework.modelling.command.AggregateLifecycle;
import org.axonframework.spring.stereotype.Aggregate;
import org.springframework.beans.factory.annotation.Autowired;

import java.time.LocalDateTime;
import java.util.UUID;

@Aggregate
@NoArgsConstructor
@Slf4j
public class PaymentAggregate {

    @AggregateIdentifier
    private UUID paymentId;
    private UUID invoiceId;
    private PaymentStatus status; // "PENDING", "SUCCESSFUL", "FAILED", "CANCELLED", "TIMEOUT"

    @Autowired
    private transient PaymentRepository paymentRepository;

    // ✅ Constructor với idempotency guard
    @CommandHandler
    public PaymentAggregate(CreatePaymentCommand command) {
        // ⚠️ CRITICAL GUARD: Aggregate đã được khởi tạo rồi
        if (this.status != null && this.status != PaymentStatus.PENDING) {
            log.warn("⚠️ [AGGREGATE GUARD] PaymentAggregate {} already exists with status {}, rejecting duplicate creation", 
                    command.getPaymentId(), this.status);
            return;
        }

        log.info("✅ [AGGREGATE] Creating PaymentAggregate: paymentId={}, invoiceId={}", 
                command.getPaymentId(), command.getInvoiceId());
        
        AggregateLifecycle.apply(new PaymentInitiatedEvent(
                command.getPaymentId(),
                command.getInvoiceId()
        ));
    }

    // ✅ CẬP NHẬT TRẠNG THÁI với multiple guards
    @CommandHandler
    public void handle(UpdatePaymentStatusCommand command) {
        PaymentStatus newStatus = PaymentStatus.valueOf(command.getStatus());
        
        // ⚠️ GUARD 1: Payment đã SUCCESSFUL - không thể thay đổi
        if (this.status == PaymentStatus.SUCCESSFUL) {
            log.warn("⚠️ [AGGREGATE GUARD] Payment {} đã SUCCESSFUL, không thể cập nhật sang {}", 
                    paymentId, newStatus);
            return;
        }
        
        // ⚠️ GUARD 2: Cùng trạng thái - idempotent
        if (this.status == newStatus) {
            log.warn("⚠️ [AGGREGATE GUARD] Payment {} đã ở trạng thái {}, bỏ qua cập nhật trùng lặp", 
                    paymentId, newStatus);
            return;
        }
        
        // ⚠️ GUARD 3: Invalid state transitions
        if (this.status == PaymentStatus.CANCELLED && 
            (newStatus == PaymentStatus.SUCCESSFUL || newStatus == PaymentStatus.FAILED)) {
            log.warn("⚠️ [AGGREGATE GUARD] Cannot transition from CANCELLED to {} for payment {}", 
                    newStatus, paymentId);
            return;
        }
        
        if (this.status == PaymentStatus.TIMEOUT && newStatus == PaymentStatus.SUCCESSFUL) {
            log.warn("⚠️ [AGGREGATE GUARD] Cannot transition from TIMEOUT to SUCCESSFUL for payment {}", 
                    paymentId);
            return;
        }

        log.info("✅ [AGGREGATE] Updating payment {} status from {} to {}", 
                paymentId, this.status, newStatus);

        // Phát sự kiện cập nhật trạng thái
        AggregateLifecycle.apply(new PaymentStatusUpdatedEvent(
                command.getPaymentId(),
                this.invoiceId,
                command.getStatus(),
                command.getReason()
        ));
    }


    // ==================== EVENT SOURCING HANDLERS ====================
    
    @EventSourcingHandler
    public void on(PaymentInitiatedEvent event) {
        log.info("📝 [EVENT SOURCING] Applying PaymentInitiatedEvent: paymentId={}", event.getPaymentId());
        this.paymentId = event.getPaymentId();
        this.invoiceId = event.getInvoiceId();
        this.status = PaymentStatus.PENDING;
    }

    @EventSourcingHandler
    public void on(PaymentStatusUpdatedEvent event) {
        PaymentStatus newStatus = PaymentStatus.valueOf(event.getStatus());
        log.info("📝 [EVENT SOURCING] Applying PaymentStatusUpdatedEvent: paymentId={}, {} -> {}", 
                event.getPaymentId(), this.status, newStatus);
        
        // ✅ State transition validation
        if (this.status == PaymentStatus.SUCCESSFUL && newStatus != PaymentStatus.SUCCESSFUL) {
            log.warn("⚠️ [EVENT SOURCING GUARD] Cannot change from SUCCESSFUL to {} for payment {}", 
                    newStatus, this.paymentId);
            return;
        }
        
        this.status = newStatus;
    }

    @EventSourcingHandler
    public void on(PaymentProcessedEvent event) {
        log.info("📝 [EVENT SOURCING] Applying PaymentProcessedEvent: paymentId={}", event.getPaymentId());
        
        // ✅ Chỉ chuyển sang SUCCESSFUL nếu đang PENDING
        if (this.status == PaymentStatus.PENDING) {
            this.status = PaymentStatus.SUCCESSFUL;
        } else {
            log.warn("⚠️ [EVENT SOURCING GUARD] Cannot process payment {} - current status: {}", 
                    this.paymentId, this.status);
        }
    }

    @EventSourcingHandler
    public void on(PaymentFailedEvent event) {
        PaymentStatus failedStatus = PaymentStatus.valueOf(event.getStatus());
        log.info("📝 [EVENT SOURCING] Applying PaymentFailedEvent: paymentId={}, status={}", 
                event.getPaymentId(), failedStatus);
        
        // ✅ Chỉ chuyển sang FAILED nếu chưa SUCCESSFUL
        if (this.status != PaymentStatus.SUCCESSFUL) {
            this.status = failedStatus;
        } else {
            log.warn("⚠️ [EVENT SOURCING GUARD] Cannot fail payment {} - already SUCCESSFUL", 
                    this.paymentId);
        }
    }

    // ✅ HELPER methods
    private boolean isPending() {
        return PaymentStatus.PENDING == this.status;
    }

    private boolean isSuccessful() {
        return PaymentStatus.SUCCESSFUL == this.status;
    }

    private boolean isFinalState() {
        return this.status == PaymentStatus.SUCCESSFUL || 
               this.status == PaymentStatus.CANCELLED;
    }

}

