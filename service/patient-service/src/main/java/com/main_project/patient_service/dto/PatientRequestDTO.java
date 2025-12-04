package com.main_project.patient_service.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

/**
 * PatientRequestDTO - Request DTO for creating/updating Patient
 *
 * Contains patient basic info and all child entity lists
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PatientRequestDTO {

    /**
     * Patient ID (required for creation)
     */
    @NotNull(message = "Patient ID is required")
    private UUID id;

    /**
     * Patient full name (required)
     */
    @NotBlank(message = "Name is required")
    private String name;

    /**
     * Date of birth
     */
    private LocalDate dob;

    /**
     * Gender (e.g., "MALE", "FEMALE", "OTHER")
     */
    private String gender;

    /**
     * Contact phone number
     */
    private String phone;

    /**
     * Medical history notes
     */
    private String medicalHistoryNote;

    /**
     * List of patient allergies (managed through aggregate)
     */
    @Builder.Default
    private List<PatientAllergyDTO> patientAllergies = new ArrayList<>();

    /**
     * List of underlying diseases (managed through aggregate)
     */
    @Builder.Default
    private List<UnderlyingDiseaseDTO> underlyingDiseases = new ArrayList<>();

    /**
     * List of tooth issues (managed through aggregate)
     */
    @Builder.Default
    private List<ToothIssueDTO> toothIssues = new ArrayList<>();
}
