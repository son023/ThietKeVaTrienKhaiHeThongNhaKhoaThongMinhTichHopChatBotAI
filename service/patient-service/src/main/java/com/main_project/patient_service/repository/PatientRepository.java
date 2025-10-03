package com.main_project.patient_service.repository;

import com.main_project.patient_service.entity.Patient;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PatientRepository extends JpaRepository<Patient, String> {
}



