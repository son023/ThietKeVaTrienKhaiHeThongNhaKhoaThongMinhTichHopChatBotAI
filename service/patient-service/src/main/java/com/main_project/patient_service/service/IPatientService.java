package com.main_project.patient_service.service;

import com.main_project.patient_service.dto.PatientRequestDTO;
import com.main_project.patient_service.dto.PatientResponseDTO;

import java.util.List;
import java.util.UUID;

public interface IPatientService {
    PatientResponseDTO createPatient(PatientRequestDTO request);

    List<PatientResponseDTO> getAllPatients();

    PatientResponseDTO getPatientById(UUID userId);

    List<PatientResponseDTO> getPatientsByGender(String gender);

    List<PatientResponseDTO> getPatientsByBloodType(String bloodType);

    PatientResponseDTO updatePatient(UUID userId, PatientRequestDTO request);

    void deletePatient(UUID userId);
}
