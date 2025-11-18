package com.main_project.appointment_service.api.command;

import com.main_project.appointment_service.enums.AppointmentStatus;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;
import lombok.Value;
import org.axonframework.modelling.command.TargetAggregateIdentifier;

import java.time.ZonedDateTime;
import java.util.UUID;

@Value
@AllArgsConstructor
public class CheckInCommand {
    @TargetAggregateIdentifier
    private String appointmentId;
    private String patientId;
}
