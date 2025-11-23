package com.main_project.doctor_service.dto;

import lombok.Data;

@Data
public class DoctorResponseDTO {
    private String userId;
    private String specializationCode;
    private String workingHospital;
    private String licenseNumber;
    private Integer consultationFeeAmount;
}
