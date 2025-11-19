package com.do_an.common.command;

import lombok.Data;
import lombok.Value;
import org.axonframework.modelling.command.TargetAggregateIdentifier;

@Value
public class UpdateCheckInCommand {
    @TargetAggregateIdentifier
    String appointmentId;
    String patientId;
}