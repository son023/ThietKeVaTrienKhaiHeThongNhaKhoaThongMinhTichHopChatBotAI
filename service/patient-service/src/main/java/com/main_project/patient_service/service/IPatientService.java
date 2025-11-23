package com.main_project.patient_service.service;

import com.main_project.patient_service.dto.PatientRequestDTO;
import com.main_project.patient_service.dto.PatientResponseDTO;

import java.util.List;

public interface IPatientService {
    PatientResponseDTO createPatient(PatientRequestDTO request);

    List<PatientResponseDTO> getAllPatients();

    PatientResponseDTO getPatientById(String userId);

    List<PatientResponseDTO> getPatientsByGender(String gender);

    List<PatientResponseDTO> getPatientsByBloodType(String bloodType);

    PatientResponseDTO updatePatient(String userId, PatientRequestDTO request);

    void deletePatient(String userId);
}
