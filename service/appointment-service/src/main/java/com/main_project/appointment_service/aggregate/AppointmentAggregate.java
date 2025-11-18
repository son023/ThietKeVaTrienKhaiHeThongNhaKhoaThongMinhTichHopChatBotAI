package com.main_project.appointment_service.aggregate;

import com.main_project.appointment_service.api.command.CheckInCommand;
import com.main_project.appointment_service.api.events.AppointmentCheckedInEvent;
import lombok.Data;
import lombok.extern.slf4j.Slf4j;
import org.axonframework.commandhandling.CommandHandler;
import org.axonframework.eventsourcing.EventSourcingHandler;
import org.axonframework.modelling.command.AggregateIdentifier;
import org.axonframework.modelling.command.AggregateLifecycle;
import org.axonframework.spring.stereotype.Aggregate;
import org.springframework.beans.BeanUtils;

import java.io.Serializable;
import java.time.ZonedDateTime;

@Aggregate
@Data
@Slf4j
public class AppointmentAggregate implements Serializable {
    @AggregateIdentifier
    private String appointmentId;

    private String patientId;
    private String doctorId;
    private ZonedDateTime appointmentStartTime;
    private int durationInMinutes;
    private String status = "CONFIRMED";
    private String doctorNotes;

    public AppointmentAggregate() {

    }

    @CommandHandler
    public void handle(CheckInCommand command) {
        log.info("Handling CheckInCommand for appointmentId {}", command.getAppointmentId());

        // --- Validation ---
        if (!"CONFIRMED".equals(this.status)) {
            throw new IllegalStateException("Appointment is not in CONFIRMED status.");
        }
        // Có thể thêm logic: chỉ được check-in 30 phút trước giờ hẹn
        // --- End Validation ---

        AppointmentCheckedInEvent event = new AppointmentCheckedInEvent();
        BeanUtils.copyProperties(command, event); // Chỉ copy appointmentId
        event.setStatus("CHECKED_IN");
        AggregateLifecycle.apply(event);

        log.info("AppointmentCheckedInEvent Applied for appointmentId {}", command.getAppointmentId());
    }

    @EventSourcingHandler
    public void on(AppointmentCheckedInEvent event) {
        this.status = event.getStatus();
    }
}
