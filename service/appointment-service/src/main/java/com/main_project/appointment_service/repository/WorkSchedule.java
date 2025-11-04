package com.main_project.appointment_service.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface WorkSchedule extends JpaRepository<WorkSchedule, UUID> {
}
