package com.main_project.patient_service.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Past;
import jakarta.validation.constraints.Pattern;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.ZonedDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

/**
 * PatientRequestDTO - Request DTO for creating/updating Patient
 *
 * Contains patient basic info and all child entity lists following the new schema design
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PatientRequestDTO {

    /**
     * Patient ID (required for creation - references Identity Service)
     */
    @NotNull(message = "Patient ID (user_id) is required")
    private UUID id;

    /**
     * Date of birth (must be in the past)
     */
    @Past(message = "Date of birth must be in the past")
    private ZonedDateTime dob;

    /**
     * Gender (e.g., "MALE", "FEMALE", "OTHER")
     */
    @Pattern(regexp = "MALE|FEMALE|OTHER", message = "Gender must be MALE, FEMALE, or OTHER")
    private String gender;

    /**
     * Patient address (free text)
     */
    private String address;

    /**
     * Contact phone number
     */
    @Pattern(regexp = "^[0-9+\\-\\s()]*$", message = "Invalid phone number format")
    private String contactPhone;

    /**
     * Blood type (e.g., "A_POSITIVE", "O_NEGATIVE", etc.)
     */
    @Pattern(regexp = "A_POSITIVE|A_NEGATIVE|B_POSITIVE|B_NEGATIVE|AB_POSITIVE|AB_NEGATIVE|O_POSITIVE|O_NEGATIVE|UNKNOWN",
            message = "Invalid blood type")
    private String bloodType;

    /**
     * Insurance number
     */
    private String insuranceNumber;

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
