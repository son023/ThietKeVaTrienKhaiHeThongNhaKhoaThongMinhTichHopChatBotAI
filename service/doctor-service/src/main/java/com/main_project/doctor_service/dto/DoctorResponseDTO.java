package com.main_project.doctor_service.dto;

import lombok.Data;
import com.main_project.doctor_service.enums.SpecializationEnum;

import java.util.List;
import java.util.UUID;

@Data
public class DoctorResponseDTO {
    private UUID userId;
    private List<SpecializationEnum> specializationCodes;
    private String workingHospital;
    private String licenseNumber;
    private Integer consultationFeeAmount;
}
