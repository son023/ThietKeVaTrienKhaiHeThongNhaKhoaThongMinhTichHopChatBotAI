package com.main_project.appointment_service.aggregate;

import com.do_an.common.command.StartAppointmentCommand;
import com.do_an.common.event.AppointmentStartedEvent;
import com.do_an.common.model.MedicalServiceDTO;
import lombok.NoArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.axonframework.commandhandling.CommandHandler;
import org.axonframework.eventsourcing.EventSourcingHandler;
import org.axonframework.modelling.command.AggregateIdentifier;
import org.axonframework.modelling.command.AggregateLifecycle;
import org.axonframework.spring.stereotype.Aggregate;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Aggregate
@NoArgsConstructor
@Slf4j
public class AppointmentAggregate {

    @AggregateIdentifier
    private UUID appointmentId;

    private String status;

    @CommandHandler
    public AppointmentAggregate(CheckInAppointmentCommand command) {
        log.info("Apply CheckInAppointmentEvent {}", command.getAppointmentId());
        AggregateLifecycle.apply(new CheckInAppointmentEvent(
                command.getAppointmentId()
        ));
    }

    @EventSourcingHandler
    public void on(CheckInAppointmentEvent event) {
        this.appointmentId = event.getAppointmentId();
        this.status = "CHECKED";
    }

    @CommandHandler
    public void handle(StartAppointmentCommand command) {

//        if (!"CHECKED".equalsIgnoreCase(this.status)) {
//            throw new IllegalStateException("Cannot start appointment before check-in");
//        }

        log.info("Apply AppointmentStartedEvent {}", command.getAppointmentId());
        AggregateLifecycle.apply(new AppointmentStartedEvent(
                command.getClinicalId(),
                command.getAppointmentId(),
                command.getPatientId(),
                command.getDoctorId(),
                copy(command.getMedicalServices())
        ));
    }

    @EventSourcingHandler
    public void on(AppointmentStartedEvent event) {
        this.appointmentId = event.getAppointmentId();
        this.status = "IN_PROGRESS";
    }

    private List<MedicalServiceDTO> copy(List<MedicalServiceDTO> s) {
        return s == null ? new ArrayList<>() : new ArrayList<>(s);
    }
}
