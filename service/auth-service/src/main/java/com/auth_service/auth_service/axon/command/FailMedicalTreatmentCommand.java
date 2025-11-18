package com.auth_service.auth_service.axon.command;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.axonframework.modelling.command.TargetAggregateIdentifier;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class FailMedicalTreatmentCommand {
    
    @TargetAggregateIdentifier
    private String treatmentId;
    
    private String failureReason;
}

