package com.main_project.doctor_service.repository;

import com.main_project.doctor_service.entity.DoctorDegree;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface DoctorDegreeRepository extends JpaRepository<DoctorDegree, String> {
    List<DoctorDegree> findByDoctor_UserId(String doctorId);
}
