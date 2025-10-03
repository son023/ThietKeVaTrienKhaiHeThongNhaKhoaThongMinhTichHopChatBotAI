package com.main_project.medical_record_service.repository;

import com.main_project.medical_record_service.entity.MedicalAttachment;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface MedicalAttachmentRepository extends JpaRepository<MedicalAttachment, String> {
    List<MedicalAttachment> findByRecordId(String recordId);
}






