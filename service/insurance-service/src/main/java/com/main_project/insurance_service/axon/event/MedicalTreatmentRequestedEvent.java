package com.main_project.insurance_service.axon.event;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.Instant;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class MedicalTreatmentRequestedEvent {
    
    private String sagaId;
    private String patientId;
    private String patientInsuranceId;
    private String medicineId;
    private Integer medicineQuantity;
    private BigDecimal claimAmount;
    private String treatmentDescription;
    private Instant requestedAt;
}


