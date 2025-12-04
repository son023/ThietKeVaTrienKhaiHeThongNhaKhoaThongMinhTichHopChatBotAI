package com.main_project.patient_service.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

/**
 * PatientResponseDTO - Response DTO for Patient
 *
 * Contains patient basic info and all child entity lists for display
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PatientResponseDTO {

    /**
     * Patient ID
     */
    private UUID id;

    /**
     * Patient full name
     */
    private String name;

    /**
     * Date of birth
     */
    private LocalDate dob;

    /**
     * Gender
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
     * List of patient allergies with allergy details
     */
    @Builder.Default
    private List<PatientAllergyDTO> patientAllergies = new ArrayList<>();

    /**
     * List of underlying diseases
     */
    @Builder.Default
    private List<UnderlyingDiseaseDTO> underlyingDiseases = new ArrayList<>();

    /**
     * List of tooth issues
     */
    @Builder.Default
    private List<ToothIssueDTO> toothIssues = new ArrayList<>();
}
