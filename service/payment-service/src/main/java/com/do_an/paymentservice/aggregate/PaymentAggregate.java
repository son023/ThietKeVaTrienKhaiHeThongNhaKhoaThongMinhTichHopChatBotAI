package com.do_an.paymentservice.aggregate;

import com.do_an.common.command.ProcessPaymentCommand;
import com.do_an.common.event.PaymentFailedEvent;
import com.do_an.common.event.PaymentProcessedEvent;
import com.do_an.paymentservice.client.InvoiceClient;
import com.do_an.paymentservice.entity.Payment;
import com.do_an.paymentservice.entity.PaymentStatus;
import com.do_an.paymentservice.repository.PaymentRepository;
import lombok.NoArgsConstructor;
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
public class PaymentAggregate {

    @AggregateIdentifier
    private UUID paymentId;

    private UUID prescriptionId;
    private UUID invoiceId;
    private Integer amount;
    private PaymentStatus status;

    @Autowired
    private transient PaymentRepository paymentRepository;

    @Autowired
    private transient InvoiceClient invoiceClient;

    @CommandHandler
    public PaymentAggregate(ProcessPaymentCommand command) {
//        this.paymentId = command.getPaymentId();
//        this.prescriptionId = command.getPrescriptionId();
//        this.invoiceId = command.getInvoiceId();
//        this.amount = command.getAmount();

        try {
            // Validate invoice exists
            //validateInvoice(command.getInvoiceId());

            // Process payment (simplified - always successful for now)
            // In real scenario, this would integrate with payment gateway
            //processPayment();

            // Emit success event
            AggregateLifecycle.apply(new PaymentProcessedEvent(
                    command.getPrescriptionId(),
                    command.getPaymentId(),
                    command.getInvoiceId()
            ));

            this.status = PaymentStatus.SUCCESSFUL;
        } catch (Exception e) {
            // Emit failure event
            AggregateLifecycle.apply(new PaymentFailedEvent(
                    command.getPrescriptionId(),
                    command.getPaymentId(),
                    "Payment processing failed: " + e.getMessage()
            ));

            this.status = PaymentStatus.FAILED;
        }
    }

    @EventSourcingHandler
    public void on(PaymentProcessedEvent event) {
        this.status = PaymentStatus.SUCCESSFUL;

        // Save payment record to database
        savePaymentRecord(event.getPaymentId(), event.getInvoiceId(), event.getPrescriptionId(),
                         this.amount, PaymentStatus.SUCCESSFUL);

        // Mark invoice as paid
        markInvoiceAsPaid(event.getInvoiceId());
    }

    @EventSourcingHandler
    public void on(PaymentFailedEvent event) {
        this.status = PaymentStatus.FAILED;

        // Save payment record with failed status
        savePaymentRecord(event.getPaymentId(), this.invoiceId, event.getPrescriptionId(),
                         this.amount, PaymentStatus.FAILED);
    }

    private void validateInvoice(UUID invoiceId) {
        try {
            invoiceClient.getInvoiceById(invoiceId);
        } catch (Exception e) {
            throw new RuntimeException("Invoice not found: " + invoiceId, e);
        }
    }

    private void processPayment() {
        // Simplified payment processing
        // In real scenario, this would:
        // 1. Call payment gateway (PayOS, etc.)
        // 2. Handle payment method (CASH, BANK_TRANSFER)
        // 3. Process payment and wait for confirmation

        // For now, we assume payment is always successful
        // This can be extended to integrate with actual payment processing logic
    }

    private void savePaymentRecord(UUID paymentId, UUID invoiceId, UUID prescriptionId,
                                  Integer amount, PaymentStatus status) {
        try {
            Payment payment = Payment.builder()
                    .id(paymentId)
                    .invoiceId(invoiceId)
                    .totalAmount(amount)
                    .status(status)
                    .paymentMethod(com.do_an.paymentservice.entity.PaymentMethod.CASH) // Default to CASH
                    .paidAt(status == PaymentStatus.SUCCESSFUL ? LocalDateTime.now() : null)
                    .description("Payment for prescription: " + prescriptionId)
                    .build();

            paymentRepository.save(payment);
        } catch (Exception e) {
            // Log error but don't fail the saga
            System.err.println("Error saving payment record: " + e.getMessage());
        }
    }

    private void markInvoiceAsPaid(UUID invoiceId) {
        try {
            invoiceClient.markAsPaid(invoiceId);
        } catch (Exception e) {
            // Log error but don't fail the saga
            System.err.println("Error marking invoice as paid: " + e.getMessage());
        }
    }
}

