package com.main_project.coreapi.insurance.commands;

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

