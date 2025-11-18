package com.auth_service.auth_service.axon.event;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.Instant;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class MedicalTreatmentInitiatedEvent {
    
    private String treatmentId;
    private String patientId;
    private String patientInsuranceId;
    private String medicineId;
    private Integer medicineQuantity;
    private BigDecimal claimAmount;
    private String treatmentDescription;
    private Instant timestamp;
}

