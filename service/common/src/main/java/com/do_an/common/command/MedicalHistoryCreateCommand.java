package com.do_an.common.command;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.axonframework.modelling.command.TargetAggregateIdentifier;

import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class MedicalHistoryCreateCommand {
    @TargetAggregateIdentifier
    private UUID clinicalId;
    private UUID appointmentId;
    private UUID patientId;
    private UUID medicalHistoryId;

}
