package com.main_project.appointment_service.service;

import com.main_project.appointment_service.dto.MedicalServiceDTO;
import com.main_project.appointment_service.dto.MedicalServiceRequestDTO;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface IMedicalService {
    List<MedicalServiceDTO> getAllMedicalServices();

    Optional<MedicalServiceDTO> getMedicalServiceById(UUID id);

    List<MedicalServiceDTO> getMedicalServicesByName(String name);

    List<MedicalServiceDTO> searchMedicalServicesByName(String keyword);

    List<MedicalServiceDTO> getMedicalServicesByType(String type);

    long countByServiceType(String type);

    long countByServiceName(String name);

    MedicalServiceDTO createMedicalService(MedicalServiceRequestDTO requestDTO);

    MedicalServiceDTO updateMedicalService(UUID id, MedicalServiceRequestDTO requestDTO);

    void deleteByServiceType(String type);

    void deleteByServiceName(String name);

    void deleteMedicalService(UUID id);
}
