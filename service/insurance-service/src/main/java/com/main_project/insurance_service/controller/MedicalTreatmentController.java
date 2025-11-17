package com.main_project.insurance_service.controller;

import com.main_project.insurance_service.axon.event.MedicalTreatmentRequestedEvent;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.axonframework.eventhandling.gateway.EventGateway;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

@RestController
@RequestMapping("/insurance-service/medical-treatment")
@Slf4j
public class MedicalTreatmentController {
    
    @Autowired
    private EventGateway eventGateway;
    
    /**
     * API để bắt đầu quy trình điều trị y tế với Saga
     */
    @PostMapping("/start")
    public ResponseEntity<?> startMedicalTreatment(@Valid @RequestBody MedicalTreatmentRequest request) {
        
        try {
            String sagaId = UUID.randomUUID().toString();
            
            log.info("Bắt đầu quy trình điều trị y tế cho bệnh nhân: {} với Saga ID: {}", 
                    request.getPatientId(), sagaId);
            
            // Tạo event để khởi động Saga
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
            
            MedicalTreatmentResponse response = new MedicalTreatmentResponse(
                    sagaId,
                    "STARTED",
                    "Quy trình điều trị y tế đã được bắt đầu. Saga ID: " + sagaId,
                    Instant.now()
            );
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            log.error("Lỗi khi bắt đầu quy trình điều trị: {}", e.getMessage(), e);
            
            MedicalTreatmentResponse errorResponse = new MedicalTreatmentResponse(
                    null,
                    "ERROR",
                    "Lỗi khi bắt đầu quy trình: " + e.getMessage(),
                    Instant.now()
            );
            
            return ResponseEntity.badRequest().body(errorResponse);
        }
    }
    
    /**
     * API để test scenario thành công
     */
    @PostMapping("/test/success")
    public ResponseEntity<?> testSuccessScenario() {
        
        MedicalTreatmentRequest request = new MedicalTreatmentRequest(
                "patient-123",
                "insurance-456", 
                "medicine-available-789", // Medicine ID có "available" sẽ thành công
                2,
                new BigDecimal("500000"),
                "Điều trị cảm cúm với thuốc kháng sinh"
        );
        
        return startMedicalTreatment(request);
    }
    
    /**
     * API để test scenario rollback (thiếu thuốc trong kho)
     */
    @PostMapping("/test/rollback")
    public ResponseEntity<?> testRollbackScenario() {
        
        MedicalTreatmentRequest request = new MedicalTreatmentRequest(
                "patient-456",
                "insurance-789",
                "medicine-outofstock-123", // Medicine ID có "outofstock" sẽ thất bại
                5,
                new BigDecimal("750000"),
                "Điều trị bệnh nặng với thuốc đặc biệt"
        );
        
        return startMedicalTreatment(request);
    }
    
    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    public static class MedicalTreatmentRequest {
        private String patientId;
        private String patientInsuranceId;
        private String medicineId;
        private Integer medicineQuantity;
        private BigDecimal claimAmount;
        private String treatmentDescription;
    }
    
    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    public static class MedicalTreatmentResponse {
        private String sagaId;
        private String status;
        private String message;
        private Instant timestamp;
    }
}
