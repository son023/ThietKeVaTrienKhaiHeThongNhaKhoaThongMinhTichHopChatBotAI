package com.main_project.insurance_service.axon.aggregate;

import com.main_project.insurance_service.axon.command.ApproveMedicalClaimCommand;
import com.main_project.insurance_service.axon.command.CancelMedicalClaimCommand;
import com.main_project.insurance_service.axon.command.CreateMedicalClaimCommand;
import com.main_project.insurance_service.axon.event.MedicalClaimApprovedEvent;
import com.main_project.insurance_service.axon.event.MedicalClaimCancelledEvent;
import com.main_project.insurance_service.axon.event.MedicalClaimCreatedEvent;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.axonframework.commandhandling.CommandHandler;
import org.axonframework.eventsourcing.EventSourcingHandler;
import org.axonframework.modelling.command.AggregateIdentifier;
import org.axonframework.modelling.command.AggregateLifecycle;
import org.axonframework.spring.stereotype.Aggregate;

import java.math.BigDecimal;
import java.time.Instant;

@Aggregate
@Data
@NoArgsConstructor
@Slf4j
public class MedicalClaimAggregate {
    
    @AggregateIdentifier
    private String claimId;
    
    private String patientId;
    private String patientInsuranceId;
    private BigDecimal claimAmount;
    private BigDecimal approvedAmount;
    private String treatmentDescription;
    private String status; // PENDING, APPROVED, CANCELLED
    private String sagaId;
    
    @CommandHandler
    public MedicalClaimAggregate(CreateMedicalClaimCommand command) {
        log.info("Xử lý command tạo claim: {}", command.getClaimId());
        
        // Business logic validation
        if (command.getClaimAmount().compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("Số tiền claim phải lớn hơn 0");
        }
        
        if (command.getPatientId() == null || command.getPatientId().isEmpty()) {
            throw new IllegalArgumentException("Patient ID không được để trống");
        }
        
        // Phát ra event
        MedicalClaimCreatedEvent event = new MedicalClaimCreatedEvent(
                command.getClaimId(),
                command.getPatientId(),
                command.getPatientInsuranceId(),
                command.getClaimAmount(),
                command.getTreatmentDescription(),
                command.getSagaId(),
                Instant.now()
        );
        
        AggregateLifecycle.apply(event);
    }
    
    @CommandHandler
    public void handle(ApproveMedicalClaimCommand command) {
        log.info("Xử lý command phê duyệt claim: {}", command.getClaimId());
        
        if (!"PENDING".equals(this.status)) {
            throw new IllegalStateException("Chỉ có thể phê duyệt claim ở trạng thái PENDING");
        }
        
        if (command.getApprovedAmount().compareTo(this.claimAmount) > 0) {
            throw new IllegalArgumentException("Số tiền phê duyệt không được vượt quá số tiền claim");
        }
        
        MedicalClaimApprovedEvent event = new MedicalClaimApprovedEvent(
                command.getClaimId(),
                command.getApprovedAmount(),
                command.getApprovalNotes(),
                Instant.now()
        );
        
        AggregateLifecycle.apply(event);
    }
    
    @CommandHandler
    public void handle(CancelMedicalClaimCommand command) {
        log.info("Xử lý command hủy claim: {}", command.getClaimId());
        
        if ("APPROVED".equals(this.status)) {
            throw new IllegalStateException("Không thể hủy claim đã được phê duyệt");
        }
        
        MedicalClaimCancelledEvent event = new MedicalClaimCancelledEvent(
                command.getClaimId(),
                command.getCancellationReason(),
                Instant.now()
        );
        
        AggregateLifecycle.apply(event);
    }
    
    @EventSourcingHandler
    public void on(MedicalClaimCreatedEvent event) {
        this.claimId = event.getClaimId();
        this.patientId = event.getPatientId();
        this.patientInsuranceId = event.getPatientInsuranceId();
        this.claimAmount = event.getClaimAmount();
        this.treatmentDescription = event.getTreatmentDescription();
        this.sagaId = event.getSagaId();
        this.status = "PENDING";
        
        log.info("Claim được tạo: {} với trạng thái PENDING", this.claimId);
    }
    
    @EventSourcingHandler
    public void on(MedicalClaimApprovedEvent event) {
        this.approvedAmount = event.getApprovedAmount();
        this.status = "APPROVED";
        
        log.info("Claim được phê duyệt: {} với số tiền: {}", this.claimId, this.approvedAmount);
    }
    
    @EventSourcingHandler
    public void on(MedicalClaimCancelledEvent event) {
        this.status = "CANCELLED";
        
        log.info("Claim bị hủy: {} với lý do: {}", this.claimId, event.getCancellationReason());
    }
}


