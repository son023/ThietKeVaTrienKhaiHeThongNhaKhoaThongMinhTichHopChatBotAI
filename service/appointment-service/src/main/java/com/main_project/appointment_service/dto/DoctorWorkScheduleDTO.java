package com.main_project.appointment_service.dto;

import com.main_project.appointment_service.entity.WorkSchedule;
import lombok.Data;

import java.time.ZonedDateTime;
import java.util.UUID;


@Data
public class DoctorWorkScheduleDTO {
    private UUID id;
    private String doctorId;
    private String status;
    private ZonedDateTime createdAt;
    private ZonedDateTime updatedAt;
    private UUID workScheduleId;
    private WorkScheduleDTO workSchedule;
}
