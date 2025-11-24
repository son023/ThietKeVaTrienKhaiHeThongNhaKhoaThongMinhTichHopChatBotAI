package com.main_project.doctor_service.dto;

import lombok.Data;

import java.time.ZonedDateTime;

@Data
public class DoctorWorkScheduleResponseDTO {
    private String id;
    private String status;
    private ZonedDateTime createdAt;
    private ZonedDateTime updatedAt;
    private String workScheduleId;
    private String doctorId;
}
