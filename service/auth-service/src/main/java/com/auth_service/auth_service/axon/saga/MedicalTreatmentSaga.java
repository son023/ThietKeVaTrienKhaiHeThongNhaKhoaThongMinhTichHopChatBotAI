package com.auth_service.auth_service.axon.saga;

import com.auth_service.auth_service.axon.command.CompleteMedicalTreatmentCommand;
import com.auth_service.auth_service.axon.command.FailMedicalTreatmentCommand;
import com.auth_service.auth_service.axon.event.MedicalTreatmentInitiatedEvent;
import com.main_project.coreapi.insurance.commands.ApproveMedicalClaimCommand;
import com.main_project.coreapi.insurance.commands.CancelMedicalClaimCommand;
import com.main_project.coreapi.insurance.commands.CreateMedicalClaimCommand;
import com.main_project.coreapi.insurance.events.MedicalClaimApprovedEvent;
import com.main_project.coreapi.insurance.events.MedicalClaimCancelledEvent;
import com.main_project.coreapi.insurance.events.MedicalClaimCreatedEvent;
import com.main_project.coreapi.inventory.commands.CancelMedicineReservationCommand;
import com.main_project.coreapi.inventory.commands.ConfirmMedicineReservationCommand;
import com.main_project.coreapi.inventory.commands.ReserveMedicineCommand;
import com.main_project.coreapi.inventory.events.MedicineReservationCancelledEvent;
import com.main_project.coreapi.inventory.events.MedicineReservationConfirmedEvent;
import com.main_project.coreapi.inventory.events.MedicineReservationFailedEvent;
import com.main_project.coreapi.inventory.events.MedicineReservedEvent;
import lombok.Data;
import lombok.extern.slf4j.Slf4j;
import org.axonframework.commandhandling.gateway.CommandGateway;
import org.axonframework.eventhandling.EventHandler;
import org.axonframework.modelling.saga.EndSaga;
import org.axonframework.modelling.saga.SagaEventHandler;
import org.axonframework.modelling.saga.StartSaga;
import org.axonframework.spring.stereotype.Saga;
import org.springframework.beans.factory.annotation.Autowired;

import java.math.BigDecimal;
import java.util.UUID;

/**
 * Medical Treatment Saga Orchestrator
 * Auth-Service điều phối Insurance-Service và Inventory-Service
 */
@Saga
@Data
@Slf4j
public class MedicalTreatmentSaga {
    
    @Autowired
    private transient CommandGateway commandGateway;
    
    // Saga State
    private String treatmentId;
    private String patientId;
    private String patientInsuranceId;
    private String claimId;
    private String reservationId;
    private String medicineId;
    private Integer medicineQuantity;
    private BigDecimal claimAmount;
    private String treatmentDescription;
    
    // Trạng thái các bước
    private boolean claimCreated = false;
    private boolean medicineReserved = false;
    private boolean claimApproved = false;
    private boolean treatmentCompleted = false;
    
    /**
     * BƯỚC 1: Bắt đầu Saga khi Treatment được khởi tạo
     */
    @StartSaga
    @SagaEventHandler(associationProperty = "treatmentId")
    public void handle(MedicalTreatmentInitiatedEvent event) {
        log.info("═══════════════════════════════════════════════════════════");
        log.info("🚀 BẮT ĐẦU MEDICAL TREATMENT SAGA");
        log.info("Treatment ID: {}", event.getTreatmentId());
        log.info("Patient ID: {}", event.getPatientId());
        log.info("Medicine ID: {}", event.getMedicineId());
        log.info("Quantity: {}", event.getMedicineQuantity());
        log.info("Claim Amount: {}", event.getClaimAmount());
        log.info("═══════════════════════════════════════════════════════════");
        
        this.treatmentId = event.getTreatmentId();
        this.patientId = event.getPatientId();
        this.patientInsuranceId = event.getPatientInsuranceId();
        this.medicineId = event.getMedicineId();
        this.medicineQuantity = event.getMedicineQuantity();
        this.claimAmount = event.getClaimAmount();
        this.treatmentDescription = event.getTreatmentDescription();
        
        // Tạo IDs cho các bước tiếp theo
        this.claimId = UUID.randomUUID().toString();
        this.reservationId = UUID.randomUUID().toString();
        
        // BƯỚC 1.1: Tạo Medical Claim (Insurance Service)
        log.info("📝 BƯỚC 1: Gửi lệnh tạo Medical Claim đến Insurance Service");
        log.info("Claim ID: {}", claimId);
        
        CreateMedicalClaimCommand createClaimCommand = new CreateMedicalClaimCommand(
                claimId,
                patientId,
                patientInsuranceId,
                claimAmount,
                treatmentDescription,
                treatmentId  // sagaId
        );
        
        commandGateway.send(createClaimCommand)
                .exceptionally(throwable -> {
                    log.error("❌ Lỗi khi gửi command tạo claim: {}", throwable.getMessage());
                    failTreatment("Không thể tạo claim: " + throwable.getMessage());
                    return null;
                });
    }
    
    /**
     * BƯỚC 2: Xử lý khi Medical Claim được tạo thành công
     */
    @SagaEventHandler(associationProperty = "sagaId", keyName = "treatmentId")
    public void handle(MedicalClaimCreatedEvent event) {
        log.info("───────────────────────────────────────────────────────────");
        log.info("✅ BƯỚC 2: Medical Claim đã được tạo thành công");
        log.info("Claim ID: {}", event.getClaimId());
        log.info("───────────────────────────────────────────────────────────");
        
        this.claimCreated = true;
        this.claimId = event.getClaimId();
        
        // BƯỚC 2.1: Đặt trước thuốc (Inventory Service)
        log.info("📦 BƯỚC 2.1: Gửi lệnh đặt trước thuốc đến Inventory Service");
        log.info("Reservation ID: {}", reservationId);
        log.info("Medicine ID: {}", medicineId);
        log.info("Quantity: {}", medicineQuantity);
        
        ReserveMedicineCommand reserveCommand = new ReserveMedicineCommand(
                reservationId,
                medicineId,
                medicineQuantity,
                patientId,
                claimId,
                treatmentId  // sagaId
        );
        
        commandGateway.send(reserveCommand)
                .exceptionally(throwable -> {
                    log.error("❌ Lỗi khi gửi command đặt trước thuốc: {}", throwable.getMessage());
                    rollbackClaim("Không thể đặt trước thuốc: " + throwable.getMessage());
                    return null;
                });
    }
    
    /**
     * BƯỚC 3: Xử lý khi thuốc được đặt trước thành công
     */
    @SagaEventHandler(associationProperty = "sagaId", keyName = "treatmentId")
    public void handle(MedicineReservedEvent event) {
        log.info("───────────────────────────────────────────────────────────");
        log.info("✅ BƯỚC 3: Thuốc đã được đặt trước thành công");
        log.info("Reservation ID: {}", event.getReservationId());
        log.info("Medicine ID: {}", event.getMedicineId());
        log.info("Quantity: {}", event.getQuantity());
        log.info("───────────────────────────────────────────────────────────");
        
        this.medicineReserved = true;
        this.reservationId = event.getReservationId();
        
        // BƯỚC 3.1: Phê duyệt Claim (Insurance Service)
        log.info("✔️ BƯỚC 3.1: Gửi lệnh phê duyệt Claim đến Insurance Service");
        log.info("Claim ID: {}", claimId);
        log.info("Approved Amount: {}", claimAmount);
        
        ApproveMedicalClaimCommand approveCommand = new ApproveMedicalClaimCommand(
                claimId,
                claimAmount,
                "Phê duyệt điều trị y tế cho thuốc " + medicineId
        );
        
        commandGateway.send(approveCommand)
                .exceptionally(throwable -> {
                    log.error("❌ Lỗi khi gửi command phê duyệt claim: {}", throwable.getMessage());
                    rollbackReservation("Không thể phê duyệt claim: " + throwable.getMessage());
                    return null;
                });
    }
    
    /**
     * BƯỚC 4: Xử lý khi Claim được phê duyệt
     */
    @SagaEventHandler(associationProperty = "claimId")
    public void handle(MedicalClaimApprovedEvent event) {
        log.info("───────────────────────────────────────────────────────────");
        log.info("✅ BƯỚC 4: Claim đã được phê duyệt");
        log.info("Claim ID: {}", event.getClaimId());
        log.info("Approved Amount: {}", event.getApprovedAmount());
        log.info("───────────────────────────────────────────────────────────");
        
        this.claimApproved = true;
        
        // BƯỚC 4.1: Xác nhận cấp phát thuốc (Inventory Service)
        String dispenseOrderId = UUID.randomUUID().toString();
        
        log.info("📋 BƯỚC 4.1: Gửi lệnh xác nhận cấp phát thuốc");
        log.info("Reservation ID: {}", reservationId);
        log.info("Dispense Order ID: {}", dispenseOrderId);
        
        ConfirmMedicineReservationCommand confirmCommand = new ConfirmMedicineReservationCommand(
                reservationId,
                dispenseOrderId
        );
        
        commandGateway.send(confirmCommand)
                .exceptionally(throwable -> {
                    log.error("❌ Lỗi khi gửi command xác nhận cấp phát: {}", throwable.getMessage());
                    // Không rollback vì claim đã được phê duyệt
                    failTreatment("Không thể xác nhận cấp phát thuốc: " + throwable.getMessage());
                    return null;
                });
    }
    
    /**
     * BƯỚC 5: Hoàn thành Saga khi thuốc được cấp phát
     */
    @SagaEventHandler(associationProperty = "reservationId")
    @EndSaga
    public void handle(MedicineReservationConfirmedEvent event) {
        log.info("═══════════════════════════════════════════════════════════");
        log.info("✅✅✅ SAGA HOÀN THÀNH THÀNH CÔNG ✅✅✅");
        log.info("Treatment ID: {}", treatmentId);
        log.info("Claim ID: {}", claimId);
        log.info("Reservation ID: {}", event.getReservationId());
        log.info("Dispense Order ID: {}", event.getDispenseOrderId());
        log.info("═══════════════════════════════════════════════════════════");
        
        this.treatmentCompleted = true;
        
        // Hoàn thành Treatment trong Auth Service
        CompleteMedicalTreatmentCommand completeCommand = new CompleteMedicalTreatmentCommand(
                treatmentId,
                event.getDispenseOrderId()
        );
        
        commandGateway.send(completeCommand);
    }
    
    // ==================== ROLLBACK SCENARIOS ====================
    
    /**
     * ROLLBACK: Khi không thể đặt trước thuốc
     */
    @SagaEventHandler(associationProperty = "sagaId", keyName = "treatmentId")
    @EndSaga
    public void handle(MedicineReservationFailedEvent event) {
        log.error("═══════════════════════════════════════════════════════════");
        log.error("❌ ROLLBACK: Không thể đặt trước thuốc");
        log.error("Lý do: {}", event.getFailureReason());
        log.error("═══════════════════════════════════════════════════════════");
        
        rollbackClaim(event.getFailureReason());
    }
    
    /**
     * ROLLBACK: Khi Claim bị hủy
     */
    @SagaEventHandler(associationProperty = "claimId")
    @EndSaga
    public void handle(MedicalClaimCancelledEvent event) {
        log.error("═══════════════════════════════════════════════════════════");
        log.error("❌ ROLLBACK: Claim đã bị hủy");
        log.error("Lý do: {}", event.getCancellationReason());
        log.error("═══════════════════════════════════════════════════════════");
        
        // Nếu đã có reservation, hủy luôn
        if (medicineReserved) {
            rollbackReservation(event.getCancellationReason());
        }
        
        failTreatment("Claim bị hủy: " + event.getCancellationReason());
    }
    
    /**
     * Xử lý khi reservation bị hủy
     */
    @SagaEventHandler(associationProperty = "reservationId")
    public void handle(MedicineReservationCancelledEvent event) {
        log.warn("🔄 Reservation đã bị hủy: {}", event.getCancellationReason());
    }
    
    // ==================== HELPER METHODS ====================
    
    private void rollbackClaim(String reason) {
        if (claimCreated) {
            log.warn("🔄 ROLLBACK: Hủy Claim");
            CancelMedicalClaimCommand cancelClaimCommand = new CancelMedicalClaimCommand(
                    claimId,
                    "Rollback: " + reason
            );
            commandGateway.send(cancelClaimCommand);
        }
        
        failTreatment(reason);
    }
    
    private void rollbackReservation(String reason) {
        if (medicineReserved) {
            log.warn("🔄 ROLLBACK: Hủy Reservation");
            CancelMedicineReservationCommand cancelReservationCommand = new CancelMedicineReservationCommand(
                    reservationId,
                    "Rollback: " + reason
            );
            commandGateway.send(cancelReservationCommand);
        }
        
        rollbackClaim(reason);
    }
    
    private void failTreatment(String reason) {
        log.error("❌ Thất bại Treatment: {}", reason);
        FailMedicalTreatmentCommand failCommand = new FailMedicalTreatmentCommand(
                treatmentId,
                reason
        );
        commandGateway.send(failCommand);
    }
}

