package com.main_project.labtest_service.feignclient.dto;

import lombok.Data;
import java.time.ZonedDateTime;
import java.util.UUID;

@Data
public class AppointmentResponseDTO {
    private UUID id;
    private UUID doctorId;
    private UUID patientId;
    private ZonedDateTime appointmentStartTime;
    private ZonedDateTime appointmentEndTime;
    private String status;
    private ZonedDateTime createdAt;
    private ZonedDateTime updatedAt;
}