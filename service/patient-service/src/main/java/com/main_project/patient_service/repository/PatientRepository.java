package com.main_project.patient_service.repository;

import com.main_project.patient_service.entity.Patient;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

/**
 * PatientRepository - Repository for Aggregate Root
 *
 * IMPORTANT: This is the ONLY repository used for write operations
 * on the Patient aggregate (including PatientAllergy, UnderlyingDisease, ToothIssue).
 */
@Repository
public interface PatientRepository extends JpaRepository<Patient, UUID> {

    /**
     * Find patient with all relationships eagerly loaded.
     * Avoids N+1 query problem.
     */
    @Query("SELECT DISTINCT p FROM Patient p " +
           "LEFT JOIN FETCH p.patientAllergies pa " +
           "LEFT JOIN FETCH pa.allergy " +
           "LEFT JOIN FETCH p.underlyingDiseases " +
           "LEFT JOIN FETCH p.toothIssues " +
           "WHERE p.id = :id")
    Optional<Patient> findByIdWithDetails(UUID id);

    // Query methods for filtering
    @Query("SELECT p FROM Patient p WHERE LOWER(p.gender) = LOWER(:gender)")
    java.util.List<Patient> findByGenderIgnoreCase(String gender);
}
