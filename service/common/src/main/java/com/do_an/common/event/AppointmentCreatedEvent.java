package com.do_an.common.event;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.ZonedDateTime;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AppointmentCreatedEvent {
    private UUID appointmentId;
    private UUID patientId;
    private UUID doctorId;
    private ZonedDateTime appointmentStartTime;
    private ZonedDateTime appointmentEndTime;
    private String message;
}