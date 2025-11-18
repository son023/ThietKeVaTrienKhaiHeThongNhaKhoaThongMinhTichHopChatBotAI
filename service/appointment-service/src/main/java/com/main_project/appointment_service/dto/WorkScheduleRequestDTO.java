package com.main_project.appointment_service.dto;

import lombok.*;

import java.time.LocalDate;
import java.time.LocalTime;
import java.time.ZonedDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Data
public class WorkScheduleRequestDTO {
    private ZonedDateTime workDate;
    private ZonedDateTime startTime;
    private ZonedDateTime endTime;
}
