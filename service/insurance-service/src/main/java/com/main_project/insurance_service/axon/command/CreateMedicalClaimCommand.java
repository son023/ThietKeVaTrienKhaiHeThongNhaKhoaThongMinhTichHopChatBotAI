package com.main_project.insurance_service.axon.command;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.axonframework.modelling.command.TargetAggregateIdentifier;

import java.math.BigDecimal;
import java.util.UUID;

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
    private String sagaId; // Để theo dõi saga transaction
}


