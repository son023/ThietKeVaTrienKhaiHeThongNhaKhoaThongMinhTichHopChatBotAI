package com.main_project.labtest_service.repository;

import com.main_project.labtest_service.entity.MedicalHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface MedicalHistoryRepository extends JpaRepository<MedicalHistory, UUID> {
    List<MedicalHistory> findByDiseaseContainingIgnoreCase(String disease);
    List<MedicalHistory> findByDiagnosisContainingIgnoreCase(String diagnosis);
    List<MedicalHistory> findByAppointmentId(UUID appointmentId);

}
