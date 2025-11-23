package com.main_project.patient_service.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class MedicalHistoryRequestDTO {

    @Size(max = 50)
    private String appointmentId;

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
    private String patientId;
}
