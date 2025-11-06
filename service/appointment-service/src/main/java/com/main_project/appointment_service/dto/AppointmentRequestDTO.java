package com.main_project.appointment_service.dto;

import com.main_project.appointment_service.enums.AppointmentStatus;
import lombok.Data;

import java.time.ZonedDateTime;
import java.util.UUID;

@Data
public class AppointmentRequestDTO {
    private UUID doctorId;
    private UUID patientId;
    private ZonedDateTime appointmentStartTime;
    private ZonedDateTime appointmentEndTime;
    private AppointmentStatus status;
    private ZonedDateTime createdAt;
    private ZonedDateTime updatedAt;
    private UUID medicalServiceId;
    private MedicalServiceDTO medicalService;
}