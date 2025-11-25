package com.main_project.patient_service.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.util.UUID;

@Data
public class MedicalHistoryRequestDTO {

    @NotNull(message = "appointmentId is required")
    private UUID appointmentId;

    @Size(max = 255)
    private String symptoms;

    @Size(max = 255)
    private String treatment;

    @Size(max = 255)
    private String diagnosis;

    @Size(max = 255)
    private String disease;

    @NotNull(message = "patientId is required")
    private UUID patientId;
}
