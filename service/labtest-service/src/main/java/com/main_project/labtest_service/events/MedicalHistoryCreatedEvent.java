package com.main_project.labtest_service.events;

import lombok.Data;

import java.util.UUID;

@Data
public class MedicalHistoryCreatedEvent {
    private String medicalHistoryId;
    private UUID appointmentId;
    private UUID patientId;
    private String status;
}
