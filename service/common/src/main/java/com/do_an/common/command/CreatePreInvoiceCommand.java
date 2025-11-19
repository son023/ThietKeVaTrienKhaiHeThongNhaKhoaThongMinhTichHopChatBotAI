package com.do_an.common.command;

import lombok.Data;
import lombok.Value;
import org.axonframework.modelling.command.TargetAggregateIdentifier;

@Value
public class CreatePreInvoiceCommand {
    @TargetAggregateIdentifier
    String invoiceId;
    String appointmentId;
    String patientId;
}