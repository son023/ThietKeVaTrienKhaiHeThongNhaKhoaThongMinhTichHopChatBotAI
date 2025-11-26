package com.main_project.patient_service.dto;

import lombok.Data;

import java.time.ZonedDateTime;
import java.util.UUID;

@Data
public class MedicalHistoryResponseDTO {
    private UUID id;
    private UUID appointmentId;
    private String symptoms;
    private String treatment;
    private String diagnosis;
    private String disease;
    private ZonedDateTime createdAt;
    private ZonedDateTime updatedAt;
    private UUID patientId;
}
