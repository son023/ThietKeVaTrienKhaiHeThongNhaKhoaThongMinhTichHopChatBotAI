package com.main_project.patient_service.dto;

import lombok.Data;

import java.time.ZonedDateTime;

@Data
public class MedicalHistoryResponseDTO {
    private String id;
    private String appointmentId;
    private String symptoms;
    private String treatment;
    private String diagnosis;
    private String disease;
    private ZonedDateTime createdAt;
    private ZonedDateTime updatedAt;
    private String patientId;
}
