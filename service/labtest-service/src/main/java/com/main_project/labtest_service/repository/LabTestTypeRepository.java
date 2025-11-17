package com.main_project.labtest_service.repository;

import com.main_project.labtest_service.entity.LabTestType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface LabTestTypeRepository extends JpaRepository<LabTestType, UUID> {
    Optional<LabTestType> findByName(String name);
}
