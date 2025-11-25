package com.do_an.common.command;


import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.axonframework.modelling.command.TargetAggregateIdentifier;

import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CancelInsuranceClaimCommand {
    @TargetAggregateIdentifier
    private UUID insuranceClaimId;
    private UUID prescriptionId;
    private String reason;
}