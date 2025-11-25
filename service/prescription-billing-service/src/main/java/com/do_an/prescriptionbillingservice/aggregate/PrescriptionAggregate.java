package com.do_an.prescriptionbillingservice.aggregate;

import com.do_an.common.command.CreatePrescriptionCommand;
import com.do_an.common.event.PrescriptionCreatedEvent;
import com.do_an.common.model.MedicineItem;
import lombok.NoArgsConstructor;
import org.axonframework.commandhandling.CommandHandler;
import org.axonframework.eventsourcing.EventSourcingHandler;
import org.axonframework.modelling.command.AggregateIdentifier;
import org.axonframework.modelling.command.AggregateLifecycle;
import org.axonframework.spring.stereotype.Aggregate;

import java.util.List;
import java.util.UUID;

@Aggregate
@NoArgsConstructor
public class PrescriptionAggregate {
    @AggregateIdentifier
    private UUID prescriptionId;
    private String status;

    @CommandHandler
    public PrescriptionAggregate(CreatePrescriptionCommand command) {
        if (command.getItems() == null || command.getItems().isEmpty()) {
            throw new IllegalArgumentException("Đơn thuốc không được rỗng");
        }

        //Kích hoạt Saga
        AggregateLifecycle.apply(new PrescriptionCreatedEvent(
                command.getPrescriptionId(),
                command.getPatientId(),
                command.getMedicalHistoryId(),
                command.getItems()
        ));

    }

    @EventSourcingHandler
    public void on(PrescriptionCreatedEvent event) {
        this.prescriptionId = event.getPrescriptionId();
        this.status = "CREATED";
    }
}
