package com.main_project.labtest_service.aggregate;

import lombok.NoArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.axonframework.commandhandling.CommandHandler;
import org.axonframework.eventsourcing.EventSourcingHandler;
import org.axonframework.modelling.command.AggregateIdentifier;
import org.axonframework.modelling.command.AggregateLifecycle;
import org.axonframework.spring.stereotype.Aggregate;

import java.util.UUID;

@Aggregate
@NoArgsConstructor
@Slf4j
public class LabTestAggregate {

    @AggregateIdentifier
    private UUID labTestId;
    private UUID appointmentId;
    private UUID medicalHistoryId;
    private UUID doctorId;
    private UUID labTechnicianId;
    private UUID labTestTypeId;
    private int price;
    private String status;

    @CommandHandler
    public LabTestAggregate(RequestLabTestCommand cmd) {
        AggregateLifecycle.apply(new LabTestRequestedEvent(
                cmd.getLabTestId(),
                cmd.getAppointmentId(),
                cmd.getMedicalHistoryId(),
                cmd.getDoctorId(),
                cmd.getLabTechnicianId(),
                cmd.getLabTestTypeId(),
                cmd.getPrice(),
                cmd.getInstructions()
        ));
    }

    @CommandHandler
    public void handle(AcceptLabTestCommand cmd) {
        if (!"REQUEST".equals(status)) {
            throw new IllegalStateException("Chỉ ACCEPT được từ REQUEST, current=" + status);
        }
        AggregateLifecycle.apply(new LabTestAcceptedEvent(cmd.getLabTestId()));
    }

    @CommandHandler
    public void handle(StartLabTestCommand cmd) {
        if (!"ACCEPTED".equals(status)) {
            throw new IllegalStateException("Chỉ IN_PROGRESS được từ ACCEPTED, current=" + status);
        }
        AggregateLifecycle.apply(new LabTestStartedEvent(cmd.getLabTestId()));
    }

    @CommandHandler
    public void handle(CompleteLabTestCommand cmd) {
        if (!"IN_PROGRESS".equals(status)) {
            throw new IllegalStateException("Chỉ COMPLETE được từ IN_PROGRESS, current=" + status);
        }
        AggregateLifecycle.apply(new LabTestCompletedEvent(cmd.getLabTestId(), cmd.getAppointmentId(), this.doctorId, cmd.getPrice()));
    }

    @EventSourcingHandler
    public void on(LabTestRequestedEvent e) {
        this.labTestId = e.getLabTestId();
        this.appointmentId = e.getAppointmentId();
        this.medicalHistoryId = e.getMedicalHistoryId();
        this.doctorId = e.getDoctorId();
        this.labTechnicianId = e.getLabTechnicianId();
        this.labTestTypeId = e.getLabTestTypeId();
        this.price = e.getPrice();
        this.status = "REQUEST";
    }

    @EventSourcingHandler
    public void on(LabTestAcceptedEvent e) {
        this.status = "ACCEPTED";
    }

    @EventSourcingHandler
    public void on(LabTestStartedEvent e) {
        this.status = "IN_PROGRESS";
    }

    @EventSourcingHandler
    public void on(LabTestCompletedEvent e) {
        this.status = "COMPLETE";
    }
}