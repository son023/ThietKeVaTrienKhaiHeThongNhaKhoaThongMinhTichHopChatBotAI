package com.main_project.appointment_service.api.events;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.ZonedDateTime;
import java.util.UUID;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class AppointmentCheckedInEvent {
    private UUID id;

    private String appointmentId;

    private String patientId;
    private String doctorId;
    private ZonedDateTime appointmentStartTime;
    private int durationInMinutes;
    private String status;
    private String doctorNotes;
}
