package com.main_project.patient_service.service;

import com.main_project.patient_service.dto.MedicalHistoryRequestDTO;
import com.main_project.patient_service.dto.MedicalHistoryResponseDTO;
import com.main_project.patient_service.entity.MedicalHistory;
import com.main_project.patient_service.entity.Patient;
import com.main_project.patient_service.repository.MedicalHistoryRepository;
import com.main_project.patient_service.repository.PatientRepository;
import com.main_project.patient_service.util.EntityMapper;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class MedicalHistoryService implements IMedicalHistoryService {

    private final MedicalHistoryRepository medicalHistoryRepository;
    private final PatientRepository patientRepository;
    private final EntityMapper mapper;

    @Override
    public MedicalHistoryResponseDTO createMedicalHistory(MedicalHistoryRequestDTO request) {
        Patient patient = findPatient(request.getPatientId());

        MedicalHistory history = mapper.toMedicalHistoryEntity(request, patient);
        history.setPatient(patient);

        MedicalHistory saved = medicalHistoryRepository.save(history);
        return mapper.toMedicalHistoryResponse(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public List<MedicalHistoryResponseDTO> getAllMedicalHistories() {
        return medicalHistoryRepository.findAll()
                .stream()
                .map(mapper::toMedicalHistoryResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public MedicalHistoryResponseDTO getMedicalHistoryById(String id) {
        return medicalHistoryRepository.findById(id)
                .map(mapper::toMedicalHistoryResponse)
                .orElseThrow(() -> new EntityNotFoundException("Medical history not found for id " + id));
    }

    @Override
    @Transactional(readOnly = true)
    public List<MedicalHistoryResponseDTO> getMedicalHistoriesByPatient(String patientId) {
        return medicalHistoryRepository.findByPatient_UserId(patientId)
                .stream()
                .map(mapper::toMedicalHistoryResponse)
                .toList();
    }

    @Override
    public MedicalHistoryResponseDTO updateMedicalHistory(String id, MedicalHistoryRequestDTO request) {
        MedicalHistory existing = medicalHistoryRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Medical history not found for id " + id));

        Patient patient = findPatient(request.getPatientId());
        mapper.updateMedicalHistoryEntity(existing, request, patient);

        MedicalHistory saved = medicalHistoryRepository.save(existing);
        return mapper.toMedicalHistoryResponse(saved);
    }

    @Override
    public void deleteMedicalHistory(String id) {
        if (!medicalHistoryRepository.existsById(id)) {
            throw new EntityNotFoundException("Medical history not found for id " + id);
        }
        medicalHistoryRepository.deleteById(id);
    }

    private Patient findPatient(String patientId) {
        return patientRepository.findById(patientId)
                .orElseThrow(() -> new EntityNotFoundException("Patient not found for user " + patientId));
    }
}
