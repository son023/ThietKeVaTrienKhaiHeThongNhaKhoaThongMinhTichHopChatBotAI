package com.do_an.userservice.repository;

import com.do_an.userservice.entity.LabTechnician;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface LabTechnicianRepository extends JpaRepository<LabTechnician, String> {
    
    Optional<LabTechnician> findByUserId(String userId);
    
    // Tìm LabTechnicians theo field
    List<LabTechnician> findAllByFieldContainingIgnoreCase(String field);
    
    // Tìm LabTechnicians theo field chính xác
    List<LabTechnician> findAllByField(String field);
}
