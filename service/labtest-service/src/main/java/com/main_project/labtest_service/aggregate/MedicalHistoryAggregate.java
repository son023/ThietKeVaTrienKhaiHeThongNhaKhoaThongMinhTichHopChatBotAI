package com.main_project.labtest_service.aggregate;

import com.do_an.common.command.CreateMedicalHistoryCommand;
import com.do_an.common.event.MedicalHistoryCreatedEvent;
import com.do_an.common.event.MedicalHistoryCreationFailedEvent;
import org.axonframework.commandhandling.CommandHandler;
import org.axonframework.eventsourcing.EventSourcingHandler;
import org.axonframework.modelling.command.AggregateIdentifier;
import org.axonframework.modelling.command.AggregateLifecycle;
import org.axonframework.spring.stereotype.Aggregate;

@Aggregate
public class MedicalHistoryAggregate {

    @AggregateIdentifier
    private String medicalHistoryId;
    private String status;

    protected MedicalHistoryAggregate() {}

    // Xử lý Lệnh cho Bước 3
    @CommandHandler
    public MedicalHistoryAggregate(CreateMedicalHistoryCommand command) {
        // --- GIẢ LẬP LỖI ---
        // (Trong thực tế, đây là logic, ví dụ: không tìm thấy thông tin bệnh nhân)
        if ("123e4567-e89b-12d3-a456-426614174999".equals(command.getPatientId())) {
            AggregateLifecycle.apply(new MedicalHistoryCreationFailedEvent(
                    command.getMedicalHistoryId(),
                    command.getAppointmentId()
            ));
            return; // Dừng xử lý
        }
        // --- HẾT GIẢ LẬP LỖI ---

        // Luồng thành công
        AggregateLifecycle.apply(new MedicalHistoryCreatedEvent(
                command.getMedicalHistoryId(),
                command.getAppointmentId()
        ));
    }

    @EventSourcingHandler
    protected void on(MedicalHistoryCreatedEvent event) {
        this.medicalHistoryId = event.getMedicalHistoryId();
        this.status = "CREATED";
    }

    @EventSourcingHandler
    protected void on(MedicalHistoryCreationFailedEvent event) {
        this.medicalHistoryId = event.getMedicalHistoryId();
        this.status = "CREATION_FAILED";
    }
}