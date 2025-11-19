package com.main_project.appointment_service.aggregate;



import com.do_an.common.command.UpdateCheckInCommand;
import com.do_an.common.event.AppointmentCheckedInEvent;
import org.axonframework.commandhandling.CommandHandler;
import org.axonframework.eventsourcing.EventSourcingHandler;
import org.axonframework.modelling.command.AggregateIdentifier;
import org.axonframework.modelling.command.AggregateLifecycle;
import org.axonframework.spring.stereotype.Aggregate;

@Aggregate
public class AppointmentAggregate {

    @AggregateIdentifier
    private String appointmentId;
    private String patientId;
    private String status;

    // Constructor mặc định cho Axon
    protected AppointmentAggregate() {
    }

    // Bước 1: Xử lý UpdateCheckIn
    @CommandHandler
    public AppointmentAggregate(UpdateCheckInCommand command) {

        // Phát sự kiện để bắt đầu Saga
        AggregateLifecycle.apply(new AppointmentCheckedInEvent(
                command.getAppointmentId(),
                command.getPatientId()
        ));
    }

    @EventSourcingHandler
    protected void on(AppointmentCheckedInEvent event) {
        this.appointmentId = event.getAppointmentId();
        this.patientId = event.getPatientId();
        this.status = "CHECKED_IN";
    }
}
