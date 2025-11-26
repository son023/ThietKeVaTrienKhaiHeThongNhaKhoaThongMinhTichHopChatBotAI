package com.main_project.patient_service.repository;

import com.main_project.patient_service.entity.Patient;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

public interface PatientRepository extends JpaRepository<Patient, UUID> {
    List<Patient> findByGenderIgnoreCase(String gender);
    List<Patient> findByBloodTypeIgnoreCase(String bloodType);
    List<Patient> findByAllergyContainingIgnoreCase(String allergyKeyword);
}
