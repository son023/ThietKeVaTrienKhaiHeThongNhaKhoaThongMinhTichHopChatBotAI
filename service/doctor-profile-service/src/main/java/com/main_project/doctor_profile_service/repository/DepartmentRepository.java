package com.main_project.doctor_profile_service.repository;

import com.main_project.doctor_profile_service.entity.Department;
import org.springframework.data.jpa.repository.JpaRepository;

public interface DepartmentRepository extends JpaRepository<Department, String> {
}



