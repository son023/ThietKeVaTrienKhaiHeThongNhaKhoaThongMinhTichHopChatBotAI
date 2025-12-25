package com.main_project.labtest_service.repository;

import com.main_project.labtest_service.entity.LabTest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.ZonedDateTime;
import java.util.List;
import java.util.UUID;

@Repository
public interface LabTestRepository extends JpaRepository<LabTest, UUID> {
        List<LabTest> findByDoctorId(UUID doctorId);
        List<LabTest> findByLabTechnician_UserId(UUID labTechnicianId);
        List<LabTest> findByStatus(String status);
        List<LabTest> findByResultDateBetween(ZonedDateTime start, ZonedDateTime end);
        List<LabTest> findByLabTestType_Id(UUID labTestTypeId);

        @Query("SELECT l FROM LabTest l WHERE l.abnormalFlag = 'Abnormal' AND l.resultDate BETWEEN :from AND :to")
        List<LabTest> findAbnormalResultsWithinRange(ZonedDateTime from, ZonedDateTime to);

        @Query("SELECT DISTINCT l FROM LabTest l LEFT JOIN FETCH l.labTestType LEFT JOIN FETCH l.medicalAttachments WHERE l.id = :id")
        java.util.Optional<LabTest> findByIdWithRelations(UUID id);

        @Query("SELECT DISTINCT l FROM LabTest l LEFT JOIN FETCH l.labTestType LEFT JOIN FETCH l.medicalAttachments ORDER BY l.createdAt DESC")
        List<LabTest> findAllWithRelations();
}
