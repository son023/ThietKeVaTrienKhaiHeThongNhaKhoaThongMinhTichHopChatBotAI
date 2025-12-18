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
    private PaymentStatus status;


    @Autowired
    private transient PaymentRepository paymentRepository;

    @CommandHandler
    public PaymentAggregate(CreatePaymentCommand command) {
        AggregateLifecycle.apply(new PaymentInitiatedEvent(
                command.getPaymentId(),
                command.getInvoiceId()
        ));
    }

    //CẬP NHẬT TRẠNG THÁI (SUCCESS/FAILED)
    @CommandHandler
    public void handle(UpdatePaymentStatusCommand command) {
        // Validate trạng thái
        if (this.status == PaymentStatus.SUCCESSFUL) {
            log.warn("Payment {} đã thành công, không thể cập nhật sang trạng thái khác.", paymentId);
            return;
        }

        // Phát sự kiện cập nhật trạng thái
            AggregateLifecycle.apply(new PaymentStatusUpdatedEvent(
                    command.getPaymentId(),
                    this.invoiceId,
                    command.getStatus(),
                    command.getReason()
            ));
    }

    private UUID invoiceId;


    @EventSourcingHandler
    public void on(PaymentInitiatedEvent event) {
        this.paymentId = event.getPaymentId();
        this.invoiceId = event.getInvoiceId();
        this.status = PaymentStatus.PENDING;
    }

    @EventSourcingHandler
    public void on(PaymentStatusUpdatedEvent event) {
        this.status = PaymentStatus.valueOf(event.getStatus());

    }

    @EventSourcingHandler
    public void on(PaymentProcessedEvent event) {
        this.status = PaymentStatus.SUCCESSFUL;
    }

    @EventSourcingHandler
    public void on(PaymentFailedEvent event) {
        this.status = PaymentStatus.valueOf(event.getStatus()) ;
    }


}

