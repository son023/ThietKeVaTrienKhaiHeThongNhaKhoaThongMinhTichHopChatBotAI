package com.main_project.clinical_service.aggregate;

import com.do_an.common.command.CreatePrescriptionCommand;
import com.do_an.common.event.PrescriptionCreatedEvent;
import lombok.NoArgsConstructor;
import org.axonframework.commandhandling.CommandHandler;
import org.axonframework.eventsourcing.EventSourcingHandler;
import org.axonframework.modelling.command.AggregateIdentifier;
import org.axonframework.modelling.command.AggregateLifecycle;
import org.axonframework.spring.stereotype.Aggregate;

import java.util.UUID;

@Aggregate
@NoArgsConstructor
public class ClinicalAggregate {
    @AggregateIdentifier
    private UUID clinicalId;
    private String status;

    @CommandHandler
    public ClinicalAggregate(StartClinicalCommand command) {

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
