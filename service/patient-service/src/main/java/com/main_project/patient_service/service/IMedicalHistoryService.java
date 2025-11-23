package com.main_project.patient_service.service;

import com.main_project.patient_service.dto.MedicalHistoryRequestDTO;
import com.main_project.patient_service.dto.MedicalHistoryResponseDTO;

import java.util.List;

public interface IMedicalHistoryService {
    MedicalHistoryResponseDTO createMedicalHistory(MedicalHistoryRequestDTO request);

    List<MedicalHistoryResponseDTO> getAllMedicalHistories();

    MedicalHistoryResponseDTO getMedicalHistoryById(String id);

    List<MedicalHistoryResponseDTO> getMedicalHistoriesByPatient(String patientId);

    MedicalHistoryResponseDTO updateMedicalHistory(String id, MedicalHistoryRequestDTO request);

    void deleteMedicalHistory(String id);
}
