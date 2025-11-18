package com.main_project.appointment_service.api.command;

import lombok.Value;

import java.time.ZonedDateTime;
import java.util.UUID;

@Value
public class CheckInCommand {
    private UUID appointmentId;

    private String patientId;
    private String doctorId;
    private ZonedDateTime appointmentStartTime;
    private int durationInMinutes;
    private String status = "CONFIRMED";
    private String doctorNotes;
}
