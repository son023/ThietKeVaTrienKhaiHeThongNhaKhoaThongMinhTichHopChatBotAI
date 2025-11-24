package com.main_project.doctor_service.dto;

import lombok.Data;

import java.util.UUID;

@Data
public class DoctorResponseDTO {
    private UUID userId;
    private String specializationCode;
    private String workingHospital;
    private String licenseNumber;
    private Integer consultationFeeAmount;
}
