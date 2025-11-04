package com.main_project.appointment_service.repository;

import com.main_project.appointment_service.entity.DoctorWorkSchedule;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface DoctorWorkScheduleRepository extends JpaRepository<DoctorWorkSchedule, UUID> {
}
