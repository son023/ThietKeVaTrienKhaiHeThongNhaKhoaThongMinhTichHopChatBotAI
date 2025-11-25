package com.do_an.common.command;

import com.do_an.common.model.InvoiceCheckerRequest;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.axonframework.modelling.command.TargetAggregateIdentifier;

import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ValidateInsuranceCommand {
    @TargetAggregateIdentifier
    private UUID insuranceClaimId;
    private UUID prescriptionId;
    private UUID invoiceId;
    private UUID patientId;
    private InvoiceCheckerRequest invoiceCheckerRequest;
}