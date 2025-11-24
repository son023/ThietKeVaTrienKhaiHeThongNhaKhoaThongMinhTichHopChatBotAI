package com.main_project.patient_service.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.time.LocalDate;
import java.util.UUID;

@Data
public class PatientRequestDTO {

    @NotBlank(message = "userId is required")
    @Size(max = 50)
    private UUID userId;

    private LocalDate dob;

    @Size(max = 50)
    private String gender;

    private String address;

    @Size(max = 50)
    private String contactPhone;

    @Size(max = 10)
    private String bloodType;

    private String allergy;

    @Size(max = 100)
    private String insuranceNumber;
}
