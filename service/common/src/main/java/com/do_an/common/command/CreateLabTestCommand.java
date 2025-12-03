package com.do_an.common.command;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.axonframework.modelling.command.TargetAggregateIdentifier;

import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CreateLabTestCommand {
    private UUID appointmentId;
    private UUID clinicalId;
    private UUID doctorId;
    private UUID patientId;
    private UUID medicalHistoryId;
    private UUID labTestTypeId;
    private Integer price;
    private String instructions;
    @TargetAggregateIdentifier
    private UUID labTestId;
}

