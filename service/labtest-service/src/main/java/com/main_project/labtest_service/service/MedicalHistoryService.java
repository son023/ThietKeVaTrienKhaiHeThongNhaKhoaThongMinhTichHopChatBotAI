package com.main_project.labtest_service.service;

import com.main_project.labtest_service.dto.MedicalHistoryDTO;
import com.main_project.labtest_service.dto.MedicalHistoryRequestDTO;
import com.main_project.labtest_service.entity.MedicalHistory;
import com.main_project.labtest_service.repository.MedicalHistoryRepository;
import com.main_project.labtest_service.util.EntityDTOMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.ZonedDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class MedicalHistoryService implements IMedicalHistory{
    private final MedicalHistoryRepository repository;
    private final EntityDTOMapper mapper;

    @Override
    public List<MedicalHistoryDTO> getAll() {
        return repository.findAll().stream()
                .map(mapper::toMedicalHistoryDTO)
                .collect(Collectors.toList());
    }

    @Override
    public MedicalHistoryDTO getById(UUID id) {
        return repository.findById(id)
                .map(mapper::toMedicalHistoryDTO)
                .orElseThrow(() -> new RuntimeException("MedicalHistory not found"));
    }

    @Override
    public MedicalHistoryDTO create(MedicalHistoryRequestDTO requestDTO) {
        MedicalHistory entity = mapper.toMedicalHistoryEntity(requestDTO);
        entity.setCreatedAt(ZonedDateTime.now());
        entity.setUpdatedAt(ZonedDateTime.now());
        return mapper.toMedicalHistoryDTO(repository.save(entity));
    }

    @Override
    public MedicalHistoryDTO update(UUID id, MedicalHistoryRequestDTO requestDTO) {
        MedicalHistory existing = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("MedicalHistory not found"));

        if (requestDTO.getAppointmentId() != null)
            existing.setAppointmentId(requestDTO.getAppointmentId());
        if (requestDTO.getSymptoms() != null)
            existing.setSymptoms(requestDTO.getSymptoms());
        if (requestDTO.getTreatment() != null)
            existing.setTreatment(requestDTO.getTreatment());
        if (requestDTO.getDiagnosis() != null)
            existing.setDiagnosis(requestDTO.getDiagnosis());
        if (requestDTO.getDisease() != null)
            existing.setDisease(requestDTO.getDisease());

        existing.setUpdatedAt(ZonedDateTime.now());
        return mapper.toMedicalHistoryDTO(repository.save(existing));
    }

    @Override
    public void delete(UUID id) {
        repository.deleteById(id);
    }

    @Override
    public List<MedicalHistoryDTO> findByAppointmentId(UUID appointmentId) {
        return repository.findByAppointmentId(appointmentId)
                .stream()
                .map(mapper::toMedicalHistoryDTO)
                .collect(Collectors.toList());
    }
}
