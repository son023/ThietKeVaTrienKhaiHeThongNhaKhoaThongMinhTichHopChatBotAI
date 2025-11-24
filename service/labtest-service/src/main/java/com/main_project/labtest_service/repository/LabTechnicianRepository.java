package com.main_project.labtest_service.repository;

import com.main_project.labtest_service.entity.LabTechnician;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.UUID;

public interface LabTechnicianRepository extends JpaRepository<LabTechnician, UUID> {
}
