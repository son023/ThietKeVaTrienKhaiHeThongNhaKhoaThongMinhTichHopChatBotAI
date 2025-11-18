package com.main_project.labtest_service.service;

import com.main_project.labtest_service.dto.MedicalHistoryDTO;
import com.main_project.labtest_service.dto.MedicalHistoryRequestDTO;

import java.util.List;
import java.util.UUID;

public interface IMedicalHistory {
    List<MedicalHistoryDTO> getAll();
    MedicalHistoryDTO getById(UUID id);
    MedicalHistoryDTO create(MedicalHistoryRequestDTO requestDTO);
    MedicalHistoryDTO update(UUID id, MedicalHistoryRequestDTO requestDTO);
    void delete(UUID id);

    List<MedicalHistoryDTO> findByAppointmentId(UUID appointmentId);
}
