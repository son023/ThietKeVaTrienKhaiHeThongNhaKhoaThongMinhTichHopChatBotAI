package com.main_project.labtest_service.service;

import com.main_project.labtest_service.dto.LabTechnicianDTO;
import com.main_project.labtest_service.dto.LabTechnicianRequestDTO;
import com.main_project.labtest_service.entity.LabTechnician;
import com.main_project.labtest_service.repository.LabTechnicianRepository;
import com.main_project.labtest_service.util.EntityDTOMapper;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional
public class LabTechnicianService implements ILabTechnicianService {

    private final LabTechnicianRepository labTechnicianRepository;
    private final EntityDTOMapper mapper;

    @Override
    public LabTechnicianDTO createLabTechnician(LabTechnicianRequestDTO request) {
        if (labTechnicianRepository.existsById(request.getUserId())) {
            throw new DataIntegrityViolationException("LabTechnician already exists for user " + request.getUserId());
        }
        LabTechnician entity = mapper.toLabTechnicianEntity(request);
        return mapper.toLabTechnicianDTO(labTechnicianRepository.save(entity));
    }

    @Override
    @Transactional(readOnly = true)
    public LabTechnicianDTO getLabTechnicianById(UUID userId) {
        return labTechnicianRepository.findById(userId)
                .map(mapper::toLabTechnicianDTO)
                .orElseThrow(() -> new EntityNotFoundException("LabTechnician not found for user " + userId));
    }

    @Override
    @Transactional(readOnly = true)
    public List<LabTechnicianDTO> getAllLabTechnicians() {
        return labTechnicianRepository.findAll()
                .stream()
                .map(mapper::toLabTechnicianDTO)
                .toList();
    }

    @Override
    public LabTechnicianDTO updateLabTechnician(UUID userId, LabTechnicianRequestDTO request) {
        LabTechnician existing = labTechnicianRepository.findById(userId)
                .orElseThrow(() -> new EntityNotFoundException("LabTechnician not found for user " + userId));
        mapper.updateLabTechnicianEntity(existing, request);
        return mapper.toLabTechnicianDTO(labTechnicianRepository.save(existing));
    }

    @Override
    public void deleteLabTechnician(UUID userId) {
        if (!labTechnicianRepository.existsById(userId)) {
            throw new EntityNotFoundException("LabTechnician not found for user " + userId);
        }
        labTechnicianRepository.deleteById(userId);
    }
}
