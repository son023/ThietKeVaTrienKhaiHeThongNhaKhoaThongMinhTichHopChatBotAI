package com.main_project.labtest_service.repository;

import com.main_project.labtest_service.dto.LabTestDTO;
import com.main_project.labtest_service.entity.LabTest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.ZonedDateTime;
import java.util.List;
import java.util.UUID;

@Repository
public interface LabTestRepository extends JpaRepository<LabTest, UUID> {
        // Lấy tất cả lab test theo bác sĩ
        List<LabTest> findByDoctorId(UUID doctorId);

        // Lấy tất cả lab test theo kỹ thuật viên xét nghiệm
        List<LabTest> findByLabTechnicianId(UUID labTechnicianId);

        // Lấy theo trạng thái (Pending, Completed, v.v.)
        List<LabTest> findByStatus(String status);

        // Lấy theo ngày có kết quả
        List<LabTest> findByResultDateBetween(ZonedDateTime start, ZonedDateTime end);

        // Lấy tất cả lab test thuộc một hồ sơ bệnh
        List<LabTest> findByMedicalHistory_Id(UUID medicalHistoryId);

        // Lấy tất cả lab test thuộc một loại xét nghiệm
        List<LabTest> findByLabTestType_Id(UUID labTestTypeId);

        // Query tùy chỉnh: lấy tất cả test bất thường trong một khoảng thời gian
        @Query("SELECT l FROM LabTest l WHERE l.abnormalFlag = 'Abnormal' AND l.resultDate BETWEEN :from AND :to")
        List<LabTest> findAbnormalResultsWithinRange(ZonedDateTime from, ZonedDateTime to);
}
