package com.main_project.clinical_service.aggregate;

import com.main_project.clinical_service.command.StartClinicalCommand;
import com.main_project.clinical_service.event.StartClinicalEvent;
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

        AggregateLifecycle.apply(new StartClinicalEvent(
                command.getClinicalId(),
                command.getAppointmentId(),
                command.getPatientId(),
                command.getMedicalServices()
        ));

    }

    @EventSourcingHandler
    public void on(StartClinicalEvent event) {
        this.clinicalId = event.getClinicalId();
        this.status = "CREATED";
    }
}
