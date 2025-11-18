package com.auth_service.auth_service.axon.aggregate;

import com.auth_service.auth_service.axon.command.CompleteMedicalTreatmentCommand;
import com.auth_service.auth_service.axon.command.FailMedicalTreatmentCommand;
import com.auth_service.auth_service.axon.command.InitiateMedicalTreatmentCommand;
import com.auth_service.auth_service.axon.event.MedicalTreatmentCompletedEvent;
import com.auth_service.auth_service.axon.event.MedicalTreatmentFailedEvent;
import com.auth_service.auth_service.axon.event.MedicalTreatmentInitiatedEvent;
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
public class MedicalTreatmentAggregate {
    
    @AggregateIdentifier
    private String treatmentId;
    
    private String patientId;
    private String patientInsuranceId;
    private String medicineId;
    private Integer medicineQuantity;
    private BigDecimal claimAmount;
    private String treatmentDescription;
    private String status; // INITIATED, COMPLETED, FAILED
    private String dispenseOrderId;
    
    @CommandHandler
    public MedicalTreatmentAggregate(InitiateMedicalTreatmentCommand command) {
        log.info("🚀 Khởi tạo Medical Treatment: {}", command.getTreatmentId());
        
        // Validation
        if (command.getClaimAmount().compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("Số tiền claim phải lớn hơn 0");
        }
        
        if (command.getMedicineQuantity() <= 0) {
            throw new IllegalArgumentException("Số lượng thuốc phải lớn hơn 0");
        }
        
        // Phát event khởi tạo điều trị
        MedicalTreatmentInitiatedEvent event = new MedicalTreatmentInitiatedEvent(
                command.getTreatmentId(),
                command.getPatientId(),
                command.getPatientInsuranceId(),
                command.getMedicineId(),
                command.getMedicineQuantity(),
                command.getClaimAmount(),
                command.getTreatmentDescription(),
                Instant.now()
        );
        
        AggregateLifecycle.apply(event);
    }
    
    @CommandHandler
    public void handle(CompleteMedicalTreatmentCommand command) {
        log.info("✅ Hoàn thành Medical Treatment: {}", command.getTreatmentId());
        
        if (!"INITIATED".equals(this.status)) {
            throw new IllegalStateException("Chỉ có thể hoàn thành treatment ở trạng thái INITIATED");
        }
        
        MedicalTreatmentCompletedEvent event = new MedicalTreatmentCompletedEvent(
                command.getTreatmentId(),
                command.getDispenseOrderId(),
                Instant.now()
        );
        
        AggregateLifecycle.apply(event);
    }
    
    @CommandHandler
    public void handle(FailMedicalTreatmentCommand command) {
        log.error("❌ Thất bại Medical Treatment: {} - Lý do: {}", 
                command.getTreatmentId(), command.getFailureReason());
        
        MedicalTreatmentFailedEvent event = new MedicalTreatmentFailedEvent(
                command.getTreatmentId(),
                command.getFailureReason(),
                Instant.now()
        );
        
        AggregateLifecycle.apply(event);
    }
    
    @EventSourcingHandler
    public void on(MedicalTreatmentInitiatedEvent event) {
        this.treatmentId = event.getTreatmentId();
        this.patientId = event.getPatientId();
        this.patientInsuranceId = event.getPatientInsuranceId();
        this.medicineId = event.getMedicineId();
        this.medicineQuantity = event.getMedicineQuantity();
        this.claimAmount = event.getClaimAmount();
        this.treatmentDescription = event.getTreatmentDescription();
        this.status = "INITIATED";
        
        log.info("Medical Treatment được khởi tạo: {}", this.treatmentId);
    }
    
    @EventSourcingHandler
    public void on(MedicalTreatmentCompletedEvent event) {
        this.dispenseOrderId = event.getDispenseOrderId();
        this.status = "COMPLETED";
        
        log.info("Medical Treatment hoàn thành: {}", this.treatmentId);
    }
    
    @EventSourcingHandler
    public void on(MedicalTreatmentFailedEvent event) {
        this.status = "FAILED";
        
        log.error("Medical Treatment thất bại: {}", this.treatmentId);
    }
}

