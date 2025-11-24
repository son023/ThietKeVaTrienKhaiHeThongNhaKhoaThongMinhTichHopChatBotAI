package com.main_project.doctor_service.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class DoctorWorkScheduleRequestDTO {

    @Size(max = 255)
    private String status;

    @NotBlank(message = "workScheduleId is required")
    @Size(max = 50)
    private String workScheduleId;

    @NotBlank(message = "doctorId is required")
    @Size(max = 50)
    private String doctorId;
}
