package com.main_project.doctor_service.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class DoctorRequestDTO {

    @NotBlank(message = "userId is required")
    @Size(max = 50)
    private String userId;

    @Size(max = 100)
    private String specializationCode;

    @Size(max = 255)
    private String workingHospital;

    @Size(max = 100)
    private String licenseNumber;

    private Integer consultationFeeAmount;
}
