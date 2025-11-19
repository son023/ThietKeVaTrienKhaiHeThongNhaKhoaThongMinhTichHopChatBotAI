package com.do_an.common.command;

import lombok.Data;
import lombok.Value;
import org.axonframework.modelling.command.TargetAggregateIdentifier;

@Value
public class RevertCheckInCommand { // Lệnh bù trừ cho Bước 1
    @TargetAggregateIdentifier
    String appointmentId;
}