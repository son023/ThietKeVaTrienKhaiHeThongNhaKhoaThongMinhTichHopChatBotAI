package com.main_project.doctor_service.repository;

import com.main_project.doctor_service.entity.WorkSchedule;
import org.springframework.data.jpa.repository.JpaRepository;

public interface WorkScheduleRepository extends JpaRepository<WorkSchedule, String> {
}
