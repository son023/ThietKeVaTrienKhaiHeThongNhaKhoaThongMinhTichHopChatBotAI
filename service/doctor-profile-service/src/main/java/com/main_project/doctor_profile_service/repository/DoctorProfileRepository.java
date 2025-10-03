package com.main_project.doctor_profile_service.repository;

import com.main_project.doctor_profile_service.entity.DoctorProfile;
import org.springframework.data.jpa.repository.JpaRepository;

public interface DoctorProfileRepository extends JpaRepository<DoctorProfile, String> {
}



