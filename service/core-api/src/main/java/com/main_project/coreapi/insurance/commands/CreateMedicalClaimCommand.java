package com.main_project.coreapi.insurance.commands;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.axonframework.modelling.command.TargetAggregateIdentifier;

import java.math.BigDecimal;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class CreateMedicalClaimCommand {
    
    @TargetAggregateIdentifier
    private String claimId;
    
    private String patientId;
    private String patientInsuranceId;
    private BigDecimal claimAmount;
    private String treatmentDescription;
    private String sagaId;
}

