package com.main_project.appointment_service.dto;

import com.main_project.appointment_service.entity.MedicalService;
import com.main_project.appointment_service.enums.AppointmentStatus;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.ZonedDateTime;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor

public class AppointmentDTO {
    private UUID id;
    private String doctorId;
    private String patientId;
    private ZonedDateTime appointmentStartTime;
    private ZonedDateTime appointmentEndTime;
    private AppointmentStatus status;
    private ZonedDateTime createdAt;
    private ZonedDateTime updatedAt;
    private UUID medicalServiceId;
    private MedicalServiceDTO medicalService;
}
