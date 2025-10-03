package com.main_project.doctor_profile_service.repository;

import com.main_project.doctor_profile_service.entity.Degree;
import org.springframework.data.jpa.repository.JpaRepository;

public interface DegreeRepository extends JpaRepository<Degree, String> {
}



