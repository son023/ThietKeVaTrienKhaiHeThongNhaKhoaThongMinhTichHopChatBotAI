package com.main_project.coreapi.insurance.commands;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.axonframework.modelling.command.TargetAggregateIdentifier;

import java.math.BigDecimal;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class ApproveMedicalClaimCommand {
    
    @TargetAggregateIdentifier
    private String claimId;
    
    private BigDecimal approvedAmount;
    private String approvalNotes;
}

