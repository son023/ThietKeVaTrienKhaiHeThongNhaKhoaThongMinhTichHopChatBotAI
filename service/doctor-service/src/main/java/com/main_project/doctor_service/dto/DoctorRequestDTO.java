package com.main_project.doctor_service.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.util.UUID;

@Data
public class DoctorRequestDTO {

    @NotNull(message = "userId is required")
    private UUID userId;

    @Size(max = 100)
    private String specializationCode;

    @Size(max = 255)
    private String workingHospital;

    @Size(max = 100)
    private String licenseNumber;

    private Integer consultationFeeAmount;
}
