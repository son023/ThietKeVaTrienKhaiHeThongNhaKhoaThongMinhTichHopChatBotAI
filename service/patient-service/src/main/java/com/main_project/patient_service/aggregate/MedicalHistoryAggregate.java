package com.main_project.patient_service.aggregate;

import lombok.NoArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.axonframework.eventsourcing.EventSourcingHandler;
import org.axonframework.modelling.command.AggregateIdentifier;
import org.axonframework.modelling.command.AggregateLifecycle;
import org.axonframework.spring.stereotype.Aggregate;

import java.util.UUID;

@Aggregate
@NoArgsConstructor
@Slf4j
public class MedicalHistoryAggregate {

    @AggregateIdentifier
    private UUID medicalHistoryId;

    public MedicalHistoryAggregate(UUID clinicalId, UUID appointmentId, UUID patientId, UUID medicalHistoryId) {
        log.info("Aggregate: Apply MedicalHistoryCreatedEvent for appointment {}", appointmentId);
        AggregateLifecycle.apply(new MedicalHistoryCreatedEvent(
                clinicalId,
                appointmentId,
                patientId,
                medicalHistoryId
        ));
    }

    @EventSourcingHandler
    public void on(MedicalHistoryCreatedEvent event) {
        this.medicalHistoryId = event.getMedicalHistoryId();
    }
}
