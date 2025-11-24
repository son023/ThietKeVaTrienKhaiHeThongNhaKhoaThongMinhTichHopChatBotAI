package com.main_project.patient_service.service;

import com.main_project.patient_service.dto.PatientRequestDTO;
import com.main_project.patient_service.dto.PatientResponseDTO;
import com.main_project.patient_service.entity.Patient;
import com.main_project.patient_service.repository.PatientRepository;
import com.main_project.patient_service.util.EntityMapper;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class PatientService implements IPatientService {

    private final PatientRepository patientRepository;
    private final EntityMapper mapper;

    @Override
    public PatientResponseDTO createPatient(PatientRequestDTO request) {
        if (patientRepository.existsById(request.getUserId())) {
            throw new DataIntegrityViolationException("Patient already exists for user " + request.getUserId());
        }

        Patient patient = mapper.toPatientEntity(request);
        return mapper.toPatientResponse(patientRepository.save(patient));
    }

    @Override
    @Transactional(readOnly = true)
    public List<PatientResponseDTO> getAllPatients() {
        return patientRepository.findAll()
                .stream()
                .map(mapper::toPatientResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public PatientResponseDTO getPatientById(String userId) {
        return patientRepository.findById(userId)
                .map(mapper::toPatientResponse)
                .orElseThrow(() -> new EntityNotFoundException("Patient not found for user " + userId));
    }

    @Override
    @Transactional(readOnly = true)
    public List<PatientResponseDTO> getPatientsByGender(String gender) {
        return patientRepository.findByGenderIgnoreCase(gender)
                .stream()
                .map(mapper::toPatientResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<PatientResponseDTO> getPatientsByBloodType(String bloodType) {
        return patientRepository.findByBloodTypeIgnoreCase(bloodType)
                .stream()
                .map(mapper::toPatientResponse)
                .toList();
    }

    @Override
    public PatientResponseDTO updatePatient(String userId, PatientRequestDTO request) {
        Patient patient = patientRepository.findById(userId)
                .orElseThrow(() -> new EntityNotFoundException("Patient not found for user " + userId));

        mapper.updatePatientEntity(patient, request);
        return mapper.toPatientResponse(patientRepository.save(patient));
    }

    @Override
    public void deletePatient(String userId) {
        if (!patientRepository.existsById(userId)) {
            throw new EntityNotFoundException("Patient not found for user " + userId);
        }
        patientRepository.deleteById(userId);
    }
}
