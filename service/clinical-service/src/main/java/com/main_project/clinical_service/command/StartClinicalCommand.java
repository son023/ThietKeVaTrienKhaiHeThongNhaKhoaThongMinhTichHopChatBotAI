package com.main_project.clinical_service.command;

import com.main_project.clinical_service.dto.MedicalServiceDTO;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.axonframework.modelling.command.TargetAggregateIdentifier;

import java.util.List;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class StartClinicalCommand {
    @TargetAggregateIdentifier
    private UUID clinicalId;
    private UUID appointmentId;
    private UUID patientId;
    private List<MedicalServiceDTO> medicalServices;

}
