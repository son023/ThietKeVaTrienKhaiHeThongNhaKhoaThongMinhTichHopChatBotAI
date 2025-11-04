package com.main_project.appointment_service.repository;

import com.main_project.appointment_service.entity.MedicalService;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface MedicalServiceRepository extends JpaRepository<MedicalService, UUID> {
}
