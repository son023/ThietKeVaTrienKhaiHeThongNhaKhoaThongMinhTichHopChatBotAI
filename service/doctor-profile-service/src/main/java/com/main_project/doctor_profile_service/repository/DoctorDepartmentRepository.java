package com.main_project.doctor_profile_service.repository;

import com.main_project.doctor_profile_service.entity.DoctorDepartment;
import com.main_project.doctor_profile_service.entity.DoctorDepartmentId;
import org.springframework.data.jpa.repository.JpaRepository;

public interface DoctorDepartmentRepository extends JpaRepository<DoctorDepartment, DoctorDepartmentId> {
}



