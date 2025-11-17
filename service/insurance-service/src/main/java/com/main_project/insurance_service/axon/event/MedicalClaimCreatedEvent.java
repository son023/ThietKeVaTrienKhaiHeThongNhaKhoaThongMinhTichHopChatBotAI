package com.main_project.insurance_service.axon.event;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.Instant;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class MedicalClaimCreatedEvent {
    
    private String claimId;
    private String patientId;
    private String patientInsuranceId;
    private BigDecimal claimAmount;
    private String treatmentDescription;
    private String sagaId;
    private Instant createdAt;
}


