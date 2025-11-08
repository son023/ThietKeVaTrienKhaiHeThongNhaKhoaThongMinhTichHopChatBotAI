package com.main_project.labtest_service.repository;

import com.main_project.labtest_service.entity.MedicalAttachment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface MedicalAttachmentRepository extends JpaRepository<MedicalAttachment, UUID> {
    List<MedicalAttachment> findByLabTest_Id(UUID labTestId);
    List<MedicalAttachment> findByTypeContainingIgnoreCase(String type);
}
