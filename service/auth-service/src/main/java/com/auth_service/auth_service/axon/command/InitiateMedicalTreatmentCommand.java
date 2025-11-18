package com.auth_service.auth_service.axon.command;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.axonframework.modelling.command.TargetAggregateIdentifier;

import java.math.BigDecimal;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class InitiateMedicalTreatmentCommand {
    
    @TargetAggregateIdentifier
    private String treatmentId;
    
    private String patientId;
    private String patientInsuranceId;
    private String medicineId;
    private Integer medicineQuantity;
    private BigDecimal claimAmount;
    private String treatmentDescription;
}

