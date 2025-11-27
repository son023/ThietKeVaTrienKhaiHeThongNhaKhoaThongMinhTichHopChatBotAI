package com.main_project.appointment_service.aggregate;

import com.do_an.common.command.AppointmentUpdateStatusCommand;
import com.do_an.common.event.AppointmentUpdateStatusEvent;
import lombok.NoArgsConstructor;
import org.axonframework.eventsourcing.EventSourcingHandler;
import org.axonframework.modelling.command.AggregateIdentifier;
import org.axonframework.modelling.command.AggregateLifecycle;
import org.axonframework.spring.stereotype.Aggregate;

import java.util.UUID;

@Aggregate
@NoArgsConstructor
public class AppointmentAggregate {

    @AggregateIdentifier
    private UUID appointmentId;

    private String status;

    public AppointmentAggregate(AppointmentUpdateStatusCommand command) {
        AggregateLifecycle.apply(new AppointmentUpdateStatusEvent(
                command.getClinicalId(),
                command.getAppointmentId(),
                command.getStatus()
        ));

    }

    public void updateStatus(AppointmentUpdateStatusCommand command) {
        AggregateLifecycle.apply(new AppointmentUpdateStatusEvent(
                command.getClinicalId(),
                command.getAppointmentId(),
                command.getStatus()
        ));
    }

    @EventSourcingHandler
    public void on(AppointmentUpdateStatusEvent event) {
        this.appointmentId = event.getAppointmentId();
        this.status = event.getStatus();
    }

}
