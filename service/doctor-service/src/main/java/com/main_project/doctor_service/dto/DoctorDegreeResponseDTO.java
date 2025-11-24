package com.main_project.doctor_service.dto;

import lombok.Data;

import java.util.UUID;

@Data
public class DoctorDegreeResponseDTO {
    private String id;
    private String degreeName;
    private String institution;
    private Integer yearObtained;
    private UUID userId;
    private String doctorId;
}
