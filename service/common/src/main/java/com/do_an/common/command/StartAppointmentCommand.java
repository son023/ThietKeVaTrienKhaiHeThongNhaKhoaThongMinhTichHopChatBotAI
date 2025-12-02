package com.do_an.common.command;

import com.do_an.common.model.MedicalServiceDTO;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.axonframework.modelling.command.TargetAggregateIdentifier;

import java.util.List;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class StartAppointmentCommand {
    @TargetAggregateIdentifier
    private UUID appointmentId;
    private UUID clinicalId;
    private UUID patientId;
    private UUID doctorId;
    private List<MedicalServiceDTO> medicalServices;

}
