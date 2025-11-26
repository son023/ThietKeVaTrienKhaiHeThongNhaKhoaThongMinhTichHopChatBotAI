package com.main_project.doctor_service.repository;

import com.main_project.doctor_service.entity.DoctorDegree;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface DoctorDegreeRepository extends JpaRepository<DoctorDegree, UUID> {
    List<DoctorDegree> findByDoctor_UserId(UUID doctorId);
}
