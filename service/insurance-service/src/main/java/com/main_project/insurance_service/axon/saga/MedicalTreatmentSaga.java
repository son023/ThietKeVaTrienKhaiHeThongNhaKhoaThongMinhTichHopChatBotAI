package com.main_project.insurance_service.axon.saga;

import com.main_project.insurance_service.axon.command.ApproveMedicalClaimCommand;
import com.main_project.insurance_service.axon.command.CancelMedicalClaimCommand;
import com.main_project.insurance_service.axon.command.CreateMedicalClaimCommand;
import com.main_project.insurance_service.axon.event.MedicalClaimApprovedEvent;
import com.main_project.insurance_service.axon.event.MedicalClaimCancelledEvent;
import com.main_project.insurance_service.axon.event.MedicalClaimCreatedEvent;
import com.main_project.insurance_service.axon.event.MedicalTreatmentRequestedEvent;
import com.main_project.insurance_service.axon.external.*;
import lombok.Data;
import lombok.extern.slf4j.Slf4j;
import org.axonframework.commandhandling.gateway.CommandGateway;
import org.axonframework.modelling.saga.EndSaga;
import org.axonframework.modelling.saga.StartSaga;
import org.axonframework.spring.stereotype.Saga;
import org.axonframework.eventhandling.EventHandler;
import org.springframework.beans.factory.annotation.Autowired;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

@Saga
@Data
@Slf4j
public class MedicalTreatmentSaga {
    
    @Autowired
    private transient CommandGateway commandGateway;
    
    private String sagaId;
    private String patientId;
    private String claimId;
    private String reservationId;
    private String medicineId;
    private Integer medicineQuantity;
    private BigDecimal claimAmount;
    private String treatmentDescription;
    
    // Trạng thái của saga
    private boolean claimCreated = false;
    private boolean claimApproved = false;
    private boolean medicineReserved = false;
    private boolean treatmentCompleted = false;
    
    /**
     * Bắt đầu Saga khi nhận được request điều trị y tế
     */
    @StartSaga
    public void on(MedicalTreatmentRequestedEvent event) {
        log.info("Bắt đầu Medical Treatment Saga với ID: {}", event.getSagaId());
        
        this.sagaId = event.getSagaId();
        this.patientId = event.getPatientId();
        this.claimId = UUID.randomUUID().toString();
        this.reservationId = UUID.randomUUID().toString();
        this.medicineId = event.getMedicineId();
        this.medicineQuantity = event.getMedicineQuantity();
        this.claimAmount = event.getClaimAmount();
        this.treatmentDescription = event.getTreatmentDescription();
        
        // Bước 1: Tạo claim bảo hiểm
        CreateMedicalClaimCommand createClaimCommand = new CreateMedicalClaimCommand(
                claimId,
                patientId,
                event.getPatientInsuranceId(),
                claimAmount,
                treatmentDescription,
                sagaId
        );
        
        log.info("Gửi lệnh tạo claim bảo hiểm: {}", claimId);
        commandGateway.send(createClaimCommand);
    }
    
    /**
     * Xử lý khi claim được tạo thành công
     */
    @EventHandler
    public void on(MedicalClaimCreatedEvent event) {
        if (!sagaId.equals(event.getSagaId())) return;
        
        log.info("Claim bảo hiểm đã được tạo: {}", event.getClaimId());
        this.claimCreated = true;
        
        // Bước 2: Đặt trước thuốc từ kho
        ReserveMedicineCommand reserveCommand = new ReserveMedicineCommand(
                reservationId,
                medicineId,
                medicineQuantity,
                patientId,
                claimId,
                sagaId
        );
        
        log.info("Gửi lệnh đặt trước thuốc: {} - Số lượng: {}", medicineId, medicineQuantity);
        commandGateway.send(reserveCommand);
    }
    
    /**
     * Xử lý khi thuốc được đặt trước thành công
     */
    @EventHandler
    public void on(MedicineReservedEvent event) {
        if (!sagaId.equals(event.getSagaId())) return;
        
        log.info("Thuốc đã được đặt trước thành công: {}", event.getReservationId());
        this.medicineReserved = true;
        
        // Bước 3: Phê duyệt claim bảo hiểm
        ApproveMedicalClaimCommand approveCommand = new ApproveMedicalClaimCommand(
                claimId,
                claimAmount, // Phê duyệt toàn bộ số tiền
                "Phê duyệt cho điều trị y tế với thuốc " + medicineId
        );
        
        log.info("Gửi lệnh phê duyệt claim: {}", claimId);
        commandGateway.send(approveCommand);
    }
    
    /**
     * Xử lý khi claim được phê duyệt
     */
    @EventHandler
    public void on(MedicalClaimApprovedEvent event) {
        log.info("Claim bảo hiểm đã được phê duyệt: {}", event.getClaimId());
        this.claimApproved = true;
        
        // Bước 4: Xác nhận cấp phát thuốc
        ConfirmMedicineReservationCommand confirmCommand = new ConfirmMedicineReservationCommand(
                reservationId,
                UUID.randomUUID().toString() // dispenseOrderId
        );
        
        log.info("Gửi lệnh xác nhận cấp phát thuốc: {}", reservationId);
        commandGateway.send(confirmCommand);
    }
    
    /**
     * Xử lý khi thuốc được xác nhận cấp phát
     */
    @EndSaga
    public void on(MedicineReservationConfirmedEvent event) {
        log.info("✅ Medical Treatment Saga hoàn thành thành công!");
        log.info("- Claim ID: {}", claimId);
        log.info("- Reservation ID: {}", event.getReservationId());
        log.info("- Dispense Order ID: {}", event.getDispenseOrderId());
        
        this.treatmentCompleted = true;
    }
    
    // ==================== ROLLBACK SCENARIOS ====================
    
    /**
     * Rollback khi không thể đặt trước thuốc
     */
    @EventHandler
    @EndSaga
    public void on(MedicineReservationFailedEvent event) {
        if (!sagaId.equals(event.getSagaId())) return;
        
        log.error("❌ Không thể đặt trước thuốc: {}", event.getFailureReason());
        
        // Rollback: Hủy claim bảo hiểm
        if (claimCreated) {
            CancelMedicalClaimCommand cancelClaimCommand = new CancelMedicalClaimCommand(
                    claimId,
                    "Hủy do không thể đặt trước thuốc: " + event.getFailureReason()
            );
            
            log.info("🔄 Rollback: Hủy claim bảo hiểm: {}", claimId);
            commandGateway.send(cancelClaimCommand);
        }
    }
    
    /**
     * Xử lý khi claim bị hủy (có thể do rollback hoặc lý do khác)
     */
    @EventHandler
    @EndSaga 
    public void on(MedicalClaimCancelledEvent event) {
        log.info("❌ Claim bảo hiểm đã bị hủy: {}", event.getCancellationReason());
        
        // Nếu đã có reservation, hủy luôn
        if (medicineReserved) {
            CancelMedicineReservationCommand cancelReservationCommand = new CancelMedicineReservationCommand(
                    reservationId,
                    "Hủy do claim bị từ chối"
            );
            
            log.info("🔄 Rollback: Hủy đặt trước thuốc: {}", reservationId);
            commandGateway.send(cancelReservationCommand);
        }
        
        log.error("❌ Medical Treatment Saga đã thất bại và được rollback!");
    }
    
    /**
     * Xử lý khi reservation bị hủy
     */
    @EventHandler
    public void on(MedicineReservationCancelledEvent event) {
        log.info("🔄 Đặt trước thuốc đã bị hủy: {}", event.getCancellationReason());
    }
}
