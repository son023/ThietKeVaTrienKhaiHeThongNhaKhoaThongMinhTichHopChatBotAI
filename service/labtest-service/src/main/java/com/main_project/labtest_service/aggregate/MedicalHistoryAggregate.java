package com.main_project.labtest_service.aggregate;

import com.main_project.labtest_service.command.CreateMedicalHistoryCommand;
import com.main_project.labtest_service.events.MedicalHistoryCreatedEvent;
import com.main_project.labtest_service.events.MedicalHistoryCreationFailedEvent;
import lombok.Data;
import lombok.extern.slf4j.Slf4j;
import org.axonframework.commandhandling.CommandHandler;
import org.axonframework.eventsourcing.EventSourcingHandler;
import org.axonframework.modelling.command.AggregateIdentifier;
import org.axonframework.modelling.command.AggregateLifecycle;
import org.axonframework.spring.stereotype.Aggregate;
import org.springframework.beans.BeanUtils;

import java.util.UUID;

@Data
@Aggregate
@Slf4j
public class MedicalHistoryAggregate {
    @AggregateIdentifier
    private String medicalHistoryId;

    private UUID appointmentId;
    private String symptoms;
    private String treatment;
    private String diagnosis;
    private String disease;
    private String status;

    public MedicalHistoryAggregate() {
        // Bắt buộc cho Axon
    }

    @CommandHandler
    public MedicalHistoryAggregate(CreateMedicalHistoryCommand command) {
        log.info("Handling CreateMedicalHistoryCommand for appointmentId {}", command.getAppointmentId());

        try {
            // --- Validation ---
            if (command.getAppointmentId() == null || command.getAppointmentId().toString().isBlank()) {
                throw new IllegalArgumentException("AppointmentId cannot be null");
            }
            if (command.getPatientId() == null || command.getPatientId().toString().isBlank()) {
                throw new IllegalArgumentException("PatientId cannot be null");
            }
            // --- End Validation ---

            MedicalHistoryCreatedEvent event = new MedicalHistoryCreatedEvent();
            BeanUtils.copyProperties(command, event);
            event.setStatus("PENDING"); // Trạng thái ban đầu
            AggregateLifecycle.apply(event);

            log.info("MedicalHistoryCreatedEvent Applied for medicalHistoryId {}", command.getMedicalHistoryId());

        } catch (Exception e) {
            // --- XỬ LÝ LỖI (BÁO SAGA ROLLBACK) ---
            log.warn("Failed to create Medical History for appointment {}: {}",
                    command.getAppointmentId(), e.getMessage());

            // Phát sự kiện LỖI để Saga bắt được
            MedicalHistoryCreationFailedEvent failureEvent = new MedicalHistoryCreationFailedEvent();
            BeanUtils.copyProperties(command, failureEvent);
            failureEvent.setReason(e.getMessage());
            AggregateLifecycle.apply(failureEvent);
        }
    }

    @EventSourcingHandler
    public void on(MedicalHistoryCreatedEvent event) {
        this.medicalHistoryId = event.getMedicalHistoryId();
        this.appointmentId = event.getAppointmentId();
        this.status = event.getStatus();
    }

    @EventSourcingHandler
    public void on(MedicalHistoryCreationFailedEvent event) {
        // Khi lỗi, aggregate này coi như chưa từng tồn tại
        // (Hoặc bạn có thể đánh dấu đã hủy)
        AggregateLifecycle.markDeleted();
    }
}
