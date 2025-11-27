package com.main_project.clinical_service.event;

import com.main_project.clinical_service.dto.MedicalServiceDTO;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.UUID;
@Data
@NoArgsConstructor
@AllArgsConstructor
public class StartClinicalEvent {
    private UUID clinicalId;
    private UUID appointmentId;
    private UUID patientId;
    private List<MedicalServiceDTO> medicalServices;
}
