package com.main_project.doctor_service.dto;

import lombok.Data;

import java.time.LocalDate;
import java.time.ZonedDateTime;

@Data
public class WorkScheduleResponseDTO {
    private String id;
    private LocalDate workDate;
    private ZonedDateTime startTime;
    private ZonedDateTime endTime;
}
