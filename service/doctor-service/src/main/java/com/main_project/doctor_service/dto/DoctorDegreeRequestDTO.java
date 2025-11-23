package com.main_project.doctor_service.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.util.UUID;

@Data
public class DoctorDegreeRequestDTO {

    @Size(max = 255)
    private String degreeName;

    @Size(max = 255)
    private String institution;

    private Integer yearObtained;

    private UUID userId;

    @NotBlank(message = "doctorId is required")
    @Size(max = 50)
    private String doctorId;
}
