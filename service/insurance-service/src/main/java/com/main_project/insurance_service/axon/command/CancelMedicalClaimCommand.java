package com.main_project.insurance_service.axon.command;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.axonframework.modelling.command.TargetAggregateIdentifier;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class CancelMedicalClaimCommand {
    
    @TargetAggregateIdentifier
    private String claimId;
    
    private String cancellationReason;
}


