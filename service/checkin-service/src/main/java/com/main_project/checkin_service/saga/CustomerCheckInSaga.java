package com.main_project.checkin_service.saga;

import com.main_project.appointment_service.api.events.AppointmentCheckedInEvent;
import com.main_project.checkin_service.api.command.RevertCheckInCommand;
import com.main_project.checkin_service.events.CheckInRevertedEvent;
import com.main_project.labtest_service.command.CreateMedicalHistoryCommand;
import com.main_project.labtest_service.events.MedicalHistoryCreatedEvent;
import com.main_project.labtest_service.events.MedicalHistoryCreationFailedEvent;
import lombok.extern.slf4j.Slf4j;
import org.axonframework.commandhandling.gateway.CommandGateway;
import org.axonframework.modelling.saga.EndSaga;
import org.axonframework.modelling.saga.SagaEventHandler;
import org.axonframework.modelling.saga.SagaLifecycle;
import org.axonframework.modelling.saga.StartSaga;
import org.axonframework.spring.stereotype.Saga;
import org.springframework.beans.factory.annotation.Autowired;

import java.util.UUID;

@Saga
@Slf4j
public class CustomerCheckInSaga {
    @Autowired
    private CommandGateway commandGateway;

    // Các biến trạng thái Saga (được Axon lưu vào CSDL)
    // --- Trạng thái Saga ---
    private String patientId;
    private String medicalHistoryId;

    // === 1. BẮT ĐẦU SAGA (Sau khi CheckIn thành công) ===
    /**
     * Saga được kích hoạt khi AppointmentAggregate phát ra AppointmentCheckedInEvent.
     */
    @StartSaga
    @SagaEventHandler(associationProperty = "appointmentId")
    public void handle(AppointmentCheckedInEvent event) {
        log.info("CustomerCheckInSaga START (Simple Flow) for appointmentId: {}", event.getAppointmentId());

        // Liên kết Saga này với appointmentId
        SagaLifecycle.associateWith("appointmentId", event.getAppointmentId());

        // Lưu lại trạng thái để dùng cho bước sau
        this.patientId = event.getPatientId();

        // --- Gửi lệnh cho Bước 2: Tạo Medical History ---
        String newMedicalHistoryId = UUID.randomUUID().toString();
        this.medicalHistoryId = newMedicalHistoryId; // Lưu lại

        // Liên kết Saga với medicalHistoryId để lắng nghe sự kiện phản hồi
        SagaLifecycle.associateWith("medicalHistoryId", newMedicalHistoryId);

        commandGateway.send(new CreateMedicalHistoryCommand(
                newMedicalHistoryId,
                event.getAppointmentId(),
                event.getPatientId()
        ));
    }

    // === 2. BƯỚC 2 THÀNH CÔNG (Tạo Medical History OK) ===
    /**
     * Lắng nghe MedicalHistoryCreatedEvent.
     * Đây là bước cuối cùng của luồng thành công.
     */
    @SagaEventHandler(associationProperty = "medicalHistoryId")
    @EndSaga
    public void handle(MedicalHistoryCreatedEvent event) {
        log.info("Step 2 OK: MedicalHistory created ({})", event.getMedicalHistoryId());
        log.info("CustomerCheckInSaga COMPLETE for appointmentId: {}", event.getAppointmentId());
    }


    // === 3. XỬ LÝ ROLLBACK (LỖI TẠI BƯỚC 2) ===
    /**
     * Xử lý LỖI tại Bước 2 (Tạo Medical History thất bại).
     * Bắt đầu quá trình rollback cho Bước 1.
     */
    @SagaEventHandler(associationProperty = "appointmentId")
    public void handle(MedicalHistoryCreationFailedEvent event) {
        log.warn("Step 2 FAILED: MedicalHistory creation failed for {}. STARTING ROLLBACK.", event.getAppointmentId());

        // --- Rollback Bước 1: Hoàn tác CheckIn ---
        // (appointmentId được lấy từ associationProperty)
        commandGateway.send(new RevertCheckInCommand(event.getAppointmentId()));
    }

    // === 4. ROLLBACK THÀNH CÔNG (Bước 1 đã hoàn tác) ===
    /**
     * Lắng nghe sự kiện Rollback Bước 1 thành công (Đã hoàn tác CheckIn).
     * Kết thúc Saga (trạng thái rollback).
     */
    @SagaEventHandler(associationProperty = "appointmentId")
    @EndSaga
    public void handle(CheckInRevertedEvent event) {
        log.info("Rollback Step 1 OK: CheckIn reverted for {}. CustomerCheckInSaga ENDED (ROLLED BACK).", event.getAppointmentId());
    }
}
