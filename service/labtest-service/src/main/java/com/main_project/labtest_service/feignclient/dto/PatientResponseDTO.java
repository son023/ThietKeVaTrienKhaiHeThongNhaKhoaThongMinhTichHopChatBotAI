package com.main_project.labtest_service.feignclient.dto;

import lombok.Data;
import java.util.UUID;

@Data
public class PatientResponseDTO {
    private UUID userId;
    private String dob;
    private String gender;
    private String address;
    private String contactPhone;
    private String bloodType;
    private String insuranceNumber;
}