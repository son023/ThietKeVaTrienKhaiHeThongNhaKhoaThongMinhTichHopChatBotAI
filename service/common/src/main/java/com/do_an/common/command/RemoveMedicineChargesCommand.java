package com.do_an.common.command;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import org.axonframework.modelling.command.TargetAggregateIdentifier;

import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class RemoveMedicineChargesCommand {
    @TargetAggregateIdentifier
    private UUID invoiceId;
    private UUID prescriptionId;
}