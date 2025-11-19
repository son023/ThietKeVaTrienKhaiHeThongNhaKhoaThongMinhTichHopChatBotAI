package com.do_an.invoiceservice.aggregate;

import com.do_an.common.command.CreatePreInvoiceCommand;
import com.do_an.common.command.DeletePreInvoiceCommand;
import com.do_an.common.event.PreInvoiceCreatedEvent;
import com.do_an.common.event.PreInvoiceCreationFailedEvent;
import com.do_an.common.event.PreInvoiceDeletedEvent;
import org.axonframework.commandhandling.CommandHandler;
import org.axonframework.eventsourcing.EventSourcingHandler;
import org.axonframework.modelling.command.AggregateIdentifier;
import org.axonframework.modelling.command.AggregateLifecycle;
import org.axonframework.spring.stereotype.Aggregate;

@Aggregate
public class InvoiceAggregate {

    @AggregateIdentifier
    private String invoiceId;
    private String appointmentId;
    private String status;

    protected InvoiceAggregate() {}

    // Xử lý Lệnh cho Bước 2
    @CommandHandler
    public InvoiceAggregate(CreatePreInvoiceCommand command) {
        // --- GIẢ LẬP LỖI ---
        // (Trong thực tế, đây là logic nghiệp vụ, ví dụ: kiểm tra bảo hiểm)
        if ("PATIENT_ID_NO_INSURANCE".equals(command.getPatientId())) {
            AggregateLifecycle.apply(new PreInvoiceCreationFailedEvent(
                    command.getInvoiceId(),
                    command.getAppointmentId()
            ));
            return; // Dừng xử lý
        }
        // --- HẾT GIẢ LẬP LỖI ---

        // Luồng thành công
        AggregateLifecycle.apply(new PreInvoiceCreatedEvent(
                command.getInvoiceId(),
                command.getAppointmentId()
        ));
    }

    @EventSourcingHandler
    protected void on(PreInvoiceCreatedEvent event) {
        this.invoiceId = event.getInvoiceId();
        this.appointmentId = event.getAppointmentId();
        this.status = "PRE_INVOICE_CREATED";
    }

    @EventSourcingHandler
    protected void on(PreInvoiceCreationFailedEvent event) {
        this.invoiceId = event.getInvoiceId();
        this.status = "CREATION_FAILED";
    }

    // Xử lý Lệnh Bù trừ cho Bước 2 (Theo yêu cầu)
    @CommandHandler
    protected void handle(DeletePreInvoiceCommand command) {
        //... (Logic xác thực)
        AggregateLifecycle.apply(new PreInvoiceDeletedEvent(command.getInvoiceId()));
    }

    @EventSourcingHandler
    protected void on(PreInvoiceDeletedEvent event) {
        this.status = "DELETED";
    }
}