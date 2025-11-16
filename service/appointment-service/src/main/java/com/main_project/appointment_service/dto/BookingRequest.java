package com.main_project.appointment_service.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Data
public class BookingRequest {
    @NotNull
    private UUID patientId;
    @NotBlank
    private UUID doctorId;
    @NotBlank
    private UUID doctorWorkScheduleId;
    private String notes;
}
