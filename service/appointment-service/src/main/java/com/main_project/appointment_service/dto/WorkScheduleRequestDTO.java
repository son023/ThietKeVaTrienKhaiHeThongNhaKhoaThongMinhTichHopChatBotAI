package com.main_project.appointment_service.dto;

import lombok.Data;
import java.time.LocalDate;
import java.time.LocalTime;
import java.time.ZonedDateTime;

@Data
public class WorkScheduleRequestDTO {
    private ZonedDateTime workDate;
    private ZonedDateTime startTime;
    private ZonedDateTime endTime;
}
