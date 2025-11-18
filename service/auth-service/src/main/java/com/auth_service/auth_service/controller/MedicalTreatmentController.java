package com.auth_service.auth_service.controller;

import com.auth_service.auth_service.axon.command.InitiateMedicalTreatmentCommand;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.axonframework.commandhandling.gateway.CommandGateway;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

@RestController
@RequestMapping("/api/medical-treatment")
@Slf4j
public class MedicalTreatmentController {
    
    @Autowired
    private CommandGateway commandGateway;
    
    /**
     * Khởi tạo điều trị y tế (Saga Orchestrator)
     */
    @PostMapping("/initiate")
    public ResponseEntity<?> initiateTreatment(@RequestBody TreatmentRequest request) {
        try {
            String treatmentId = UUID.randomUUID().toString();
            
            log.info("═══════════════════════════════════════════════════════════");
            log.info("🏥 KHỞI TẠO MEDICAL TREATMENT SAGA");
            log.info("Patient ID: {}", request.getPatientId());
            log.info("Medicine ID: {}", request.getMedicineId());
            log.info("Quantity: {}", request.getMedicineQuantity());
            log.info("═══════════════════════════════════════════════════════════");
            
            InitiateMedicalTreatmentCommand command = new InitiateMedicalTreatmentCommand(
                    treatmentId,
                    request.getPatientId(),
                    request.getPatientInsuranceId(),
                    request.getMedicineId(),
                    request.getMedicineQuantity(),
                    request.getClaimAmount(),
                    request.getTreatmentDescription()
            );
            
            commandGateway.send(command)
                    .thenAccept(result -> {
                        log.info("✅ Treatment được khởi tạo thành công: {}", treatmentId);
                    })
                    .exceptionally(throwable -> {
                        log.error("❌ Lỗi khi khởi tạo treatment: {}", throwable.getMessage());
                        return null;
                    });
            
            return ResponseEntity.ok(new TreatmentResponse(
                    treatmentId,
                    "INITIATED",
                    "Medical treatment saga đã được khởi tạo",
                    Instant.now()
            ));
            
        } catch (Exception e) {
            log.error("❌ Exception khi khởi tạo treatment: {}", e.getMessage(), e);
            return ResponseEntity.badRequest().body(new TreatmentResponse(
                    null,
                    "ERROR",
                    "Lỗi: " + e.getMessage(),
                    Instant.now()
            ));
        }
    }
    
    /**
     * Test scenario thành công
     */
    @PostMapping("/test/success")
    public ResponseEntity<?> testSuccessScenario() {
        TreatmentRequest request = new TreatmentRequest(
                "patient-success-" + System.currentTimeMillis(),
                "insurance-policy-456",
                "medicine-available-success",  // Available = success
                2,
                new BigDecimal("500000"),
                "Test scenario: Điều trị thành công với thuốc có sẵn"
        );
        
        return initiateTreatment(request);
    }
    
    /**
     * Test scenario rollback (thuốc hết hàng)
     */
    @PostMapping("/test/rollback")
    public ResponseEntity<?> testRollbackScenario() {
        TreatmentRequest request = new TreatmentRequest(
                "patient-rollback-" + System.currentTimeMillis(),
                "insurance-policy-789",
                "medicine-outofstock-fail",  // Out of stock = failure
                5,
                new BigDecimal("750000"),
                "Test scenario: Rollback do thuốc hết hàng"
        );
        
        return initiateTreatment(request);
    }
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TreatmentRequest {
        private String patientId;
        private String patientInsuranceId;
        private String medicineId;
        private Integer medicineQuantity;
        private BigDecimal claimAmount;
        private String treatmentDescription;
    }
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TreatmentResponse {
        private String treatmentId;
        private String status;
        private String message;
        private Instant timestamp;
    }
}

