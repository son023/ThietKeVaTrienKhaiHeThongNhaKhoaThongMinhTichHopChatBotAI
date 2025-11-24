package com.main_project.patient_service.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.util.UUID;

@Data
public class MedicalHistoryRequestDTO {

    @Size(max = 50)
    private UUID appointmentId;

    @Size(max = 255)
    private String symptoms;

    @Size(max = 255)
    private String treatment;

    @Size(max = 255)
    private String diagnosis;

    @Size(max = 255)
    private String disease;

    @NotBlank(message = "patientId is required")
    @Size(max = 50)
    private UUID patientId;
}
