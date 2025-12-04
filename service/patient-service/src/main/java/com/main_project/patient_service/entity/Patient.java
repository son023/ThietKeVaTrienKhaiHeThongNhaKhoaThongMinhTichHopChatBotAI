package com.main_project.patient_service.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

/**
 * Patient - Aggregate Root (DDD)
 *
 * This is the Aggregate Root for the Patient aggregate.
 * All operations on PatientAllergy, UnderlyingDisease, and ToothIssue
 * must go through this aggregate root.
 *
 * Direct manipulation through separate repositories is NOT allowed.
 */
@Entity
@Table(name = "patient")
@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Patient {

    @Id
    @Column(name = "user_id")
    private UUID id;

    @Column(name = "name", length = 255, nullable = false)
    private String name;

    @Column(name = "dob")
    private LocalDate dob;

    @Column(name = "gender", length = 50)
    private String gender;

    @Column(name = "phone", length = 50)
    private String phone;

    @Column(name = "medical_history_note", columnDefinition = "TEXT")
    private String medicalHistoryNote;

    // Composition relationships - all use cascade ALL and orphanRemoval
    @Builder.Default
    @OneToMany(mappedBy = "patient", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<PatientAllergy> patientAllergies = new ArrayList<>();

    @Builder.Default
    @OneToMany(mappedBy = "patient", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<UnderlyingDisease> underlyingDiseases = new ArrayList<>();

    @Builder.Default
    @OneToMany(mappedBy = "patient", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<ToothIssue> toothIssues = new ArrayList<>();

    // Kept for backward compatibility (if exists)
    @Builder.Default
    @OneToMany(mappedBy = "patient", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<MedicalHistory> medicalHistories = new ArrayList<>();

    // ========== Aggregate Root Business Methods ==========

    // ==================== PatientAllergy Management ====================

    /**
     * Adds an allergy to this patient with allergy reference lookup.
     *
     * @param allergy the allergy master data reference
     * @param severity severity level (MILD, MODERATE, SEVERE)
     * @param reaction the reaction description
     * @param note additional notes
     * @return the newly created PatientAllergy
     */
    public PatientAllergy addPatientAllergy(Allergy allergy, String severity, String reaction, String note) {
        if (allergy == null) {
            throw new IllegalArgumentException("Allergy cannot be null");
        }
        PatientAllergy patientAllergy = PatientAllergy.builder()
                .allergy(allergy)
                .severity(severity)
                .reaction(reaction)
                .note(note)
                .build();
        patientAllergy.setPatientInternal(this);
        this.patientAllergies.add(patientAllergy);
        return patientAllergy;
    }

    /**
     * Adds a pre-built PatientAllergy to this patient.
     *
     * @param patientAllergy the patient allergy to add
     */
    public void addPatientAllergy(PatientAllergy patientAllergy) {
        if (patientAllergy == null) {
            throw new IllegalArgumentException("PatientAllergy cannot be null");
        }
        patientAllergy.setPatientInternal(this);
        this.patientAllergies.add(patientAllergy);
    }

    /**
     * Removes a patient allergy from this patient.
     */
    public void removePatientAllergy(PatientAllergy patientAllergy) {
        this.patientAllergies.remove(patientAllergy);
        if (patientAllergy != null) {
            patientAllergy.setPatientInternal(null);
        }
    }

    /**
     * Clears all patient allergies.
     */
    public void clearPatientAllergies() {
        this.patientAllergies.clear();
    }

    // ==================== UnderlyingDisease Management ====================

    /**
     * Adds an underlying disease to this patient.
     *
     * @param name disease name
     * @param status current status
     * @param severity severity level
     * @param isVerified whether clinically verified
     * @param note additional notes
     * @return the newly created UnderlyingDisease
     */
    public UnderlyingDisease addUnderlyingDisease(String name, String status, String severity,
                                                    Boolean isVerified, String note) {
        UnderlyingDisease disease = UnderlyingDisease.builder()
                .name(name)
                .status(status)
                .severity(severity)
                .isVerified(isVerified)
                .note(note)
                .build();
        disease.setPatientInternal(this);
        this.underlyingDiseases.add(disease);
        return disease;
    }

    /**
     * Adds a pre-built UnderlyingDisease to this patient.
     */
    public void addUnderlyingDisease(UnderlyingDisease disease) {
        if (disease == null) {
            throw new IllegalArgumentException("UnderlyingDisease cannot be null");
        }
        disease.setPatientInternal(this);
        this.underlyingDiseases.add(disease);
    }

    /**
     * Removes an underlying disease from this patient.
     */
    public void removeUnderlyingDisease(UnderlyingDisease disease) {
        this.underlyingDiseases.remove(disease);
        if (disease != null) {
            disease.setPatientInternal(null);
        }
    }

    /**
     * Clears all underlying diseases.
     */
    public void clearUnderlyingDiseases() {
        this.underlyingDiseases.clear();
    }

    // ==================== ToothIssue Management ====================

    /**
     * Adds a tooth issue to this patient.
     *
     * @param toothNumber tooth number (1-32)
     * @param status issue status
     * @param description issue description
     * @param diagnosedDate date diagnosed
     * @param note additional notes
     * @return the newly created ToothIssue
     */
    public ToothIssue addToothIssue(Integer toothNumber, String status, String description,
                                     LocalDate diagnosedDate, String note) {
        ToothIssue toothIssue = ToothIssue.builder()
                .toothNumber(toothNumber)
                .status(status)
                .description(description)
                .diagnosedDate(diagnosedDate)
                .note(note)
                .build();
        toothIssue.setPatientInternal(this);
        this.toothIssues.add(toothIssue);
        return toothIssue;
    }

    /**
     * Adds a pre-built ToothIssue to this patient.
     */
    public void addToothIssue(ToothIssue toothIssue) {
        if (toothIssue == null) {
            throw new IllegalArgumentException("ToothIssue cannot be null");
        }
        toothIssue.setPatientInternal(this);
        this.toothIssues.add(toothIssue);
    }

    /**
     * Removes a tooth issue from this patient.
     */
    public void removeToothIssue(ToothIssue toothIssue) {
        this.toothIssues.remove(toothIssue);
        if (toothIssue != null) {
            toothIssue.setPatientInternal(null);
        }
    }

    /**
     * Clears all tooth issues.
     */
    public void clearToothIssues() {
        this.toothIssues.clear();
    }

    // ==================== Basic Info Update ====================

    /**
     * Updates the patient's basic information.
     */
    public void updateBasicInfo(String name, LocalDate dob, String gender, String phone, String medicalHistoryNote) {
        this.name = name;
        this.dob = dob;
        this.gender = gender;
        this.phone = phone;
        this.medicalHistoryNote = medicalHistoryNote;
    }
}
