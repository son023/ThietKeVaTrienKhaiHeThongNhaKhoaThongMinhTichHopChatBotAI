package com.main_project.medical_record_service.repository;

import com.main_project.medical_record_service.entity.MedicalRecord;
import org.springframework.data.jpa.repository.JpaRepository;

public interface MedicalRecordRepository extends JpaRepository<MedicalRecord, String> {
}






