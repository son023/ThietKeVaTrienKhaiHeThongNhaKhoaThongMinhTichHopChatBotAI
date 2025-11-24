package com.main_project.patient_service.repository;

import com.main_project.patient_service.entity.MedicalHistory;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface MedicalHistoryRepository extends JpaRepository<MedicalHistory, String> {
    List<MedicalHistory> findByDiseaseContainingIgnoreCase(String disease);
    List<MedicalHistory> findByDiagnosisContainingIgnoreCase(String diagnosis);
    List<MedicalHistory> findByAppointmentId(String appointmentId);
    List<MedicalHistory> findByPatient_UserId(String patientId);
}
