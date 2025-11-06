package com.main_project.appointment_service.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import jakarta.persistence.Column;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalTime;
import java.time.ZonedDateTime;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Data
public class WorkScheduleDTO {
    private UUID id;
    private ZonedDateTime workDate;
    private ZonedDateTime startTime;
    private ZonedDateTime endTime;
}
