package com.main_project.insurance_service.controller;

import com.main_project.insurance_service.axon.event.MedicalTreatmentRequestedEvent;
import lombok.Data;
import lombok.extern.slf4j.Slf4j;
import org.axonframework.eventhandling.gateway.EventGateway;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

@RestController
@RequestMapping("/saga-test")
@Slf4j
public class SagaTestController {
    
    @Autowired
    private EventGateway eventGateway;
    
    @PostMapping("/trigger")
    public ResponseEntity<?> triggerSaga(@RequestBody SagaTestRequest request) {
        try {
            String sagaId = UUID.randomUUID().toString();
            
            log.info("🚀 Triggering Medical Treatment Saga - Patient: {}, Medicine: {}", 
                    request.getPatientId(), request.getMedicineId());
            
            MedicalTreatmentRequestedEvent event = new MedicalTreatmentRequestedEvent(
                    sagaId,
                    request.getPatientId(),
                    request.getPatientInsuranceId(),
                    request.getMedicineId(), 
                    request.getMedicineQuantity(),
                    request.getClaimAmount(),
                    request.getTreatmentDescription(),
                    Instant.now()
            );
            
            eventGateway.publish(event);
            
            return ResponseEntity.ok(new SagaTestResponse(
                    sagaId,
                    "STARTED", 
                    "Saga triggered successfully",
                    Instant.now()
            ));
            
        } catch (Exception e) {
            log.error("❌ Failed to trigger saga: {}", e.getMessage(), e);
            return ResponseEntity.badRequest().body(new SagaTestResponse(
                    null,
                    "ERROR",
                    "Failed to trigger saga: " + e.getMessage(),
                    Instant.now()
            ));
        }
    }
    
    @PostMapping("/success")
    public ResponseEntity<?> testSuccess() {
        SagaTestRequest request = new SagaTestRequest(
                "patient-success-" + System.currentTimeMillis(),
                "insurance-policy-456",
                "medicine-available-success", // Available = success
                2,
                new BigDecimal("500000"),
                "Success scenario test - medicine available"
        );
        return triggerSaga(request);
    }
    
    @PostMapping("/rollback") 
    public ResponseEntity<?> testRollback() {
        SagaTestRequest request = new SagaTestRequest(
                "patient-rollback-" + System.currentTimeMillis(),
                "insurance-policy-789", 
                "medicine-outofstock-fail", // Outofstock = failure
                5,
                new BigDecimal("750000"),
                "Rollback scenario test - medicine out of stock"
        );
        return triggerSaga(request);
    }
    
    @Data
    public static class SagaTestRequest {
        private String patientId;
        private String patientInsuranceId;
        private String medicineId;
        private Integer medicineQuantity;
        private BigDecimal claimAmount;
        private String treatmentDescription;
        
        public SagaTestRequest() {}
        
        public SagaTestRequest(String patientId, String patientInsuranceId, String medicineId, 
                              Integer medicineQuantity, BigDecimal claimAmount, String treatmentDescription) {
            this.patientId = patientId;
            this.patientInsuranceId = patientInsuranceId;
            this.medicineId = medicineId;
            this.medicineQuantity = medicineQuantity;
            this.claimAmount = claimAmount;
            this.treatmentDescription = treatmentDescription;
        }
    }
    
    @Data
    public static class SagaTestResponse {
        private String sagaId;
        private String status;
        private String message;
        private Instant timestamp;
        
        public SagaTestResponse() {}
        
        public SagaTestResponse(String sagaId, String status, String message, Instant timestamp) {
            this.sagaId = sagaId;
            this.status = status;
            this.message = message;
            this.timestamp = timestamp;
        }
    }
}
