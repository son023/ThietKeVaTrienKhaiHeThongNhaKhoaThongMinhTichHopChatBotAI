package com.main_project.patient_service.dto;

import lombok.Data;

import java.time.LocalDate;
import java.util.UUID;

@Data
public class PatientResponseDTO {
    private UUID userId;
    private LocalDate dob;
    private String gender;
    private String address;
    private String contactPhone;
    private String bloodType;
    private String allergy;
    private String insuranceNumber;
}
