package com.main_project.clinical_service.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.UUID;
@Data
@NoArgsConstructor
@AllArgsConstructor
public class StartClinicalrRequest {
    private UUID appointmentId;
    private UUID patientId;
    private List<MedicalServiceDTO> medicalServices;
}
