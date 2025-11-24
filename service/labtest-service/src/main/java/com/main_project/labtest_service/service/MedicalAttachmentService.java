package com.main_project.labtest_service.service;

import com.main_project.labtest_service.dto.MedicalAttachmentDTO;
import com.main_project.labtest_service.dto.MedicalAttachmentRequestDTO;
import com.main_project.labtest_service.entity.LabTest;
import com.main_project.labtest_service.entity.MedicalAttachment;
import com.main_project.labtest_service.repository.LabTestRepository;
import com.main_project.labtest_service.repository.MedicalAttachmentRepository;
import com.main_project.labtest_service.util.EntityDTOMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class MedicalAttachmentService implements IMedicalAttachment{
    private final MedicalAttachmentRepository repository;
    private final LabTestRepository labTestRepository;
    private final EntityDTOMapper mapper;

    @Override
    public MedicalAttachmentDTO create(MedicalAttachmentRequestDTO requestDTO) {
        LabTest labTest = null;
        if (requestDTO.getLabTestId() != null) {
            labTest = labTestRepository.findById(requestDTO.getLabTestId())
                    .orElseThrow(() -> new RuntimeException("LabTest not found"));
        }

        MedicalAttachment entity = mapper.toMedicalAttachmentEntity(requestDTO, labTest);
        repository.save(entity);
        return mapper.toMedicalAttachmentDTO(entity);
    }

    @Override
    public MedicalAttachmentDTO update(UUID id, MedicalAttachmentRequestDTO requestDTO) {
        MedicalAttachment entity = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("MedicalAttachment not found"));

        LabTest labTest = null;
        if (requestDTO.getLabTestId() != null) {
            labTest = labTestRepository.findById(requestDTO.getLabTestId())
                    .orElseThrow(() -> new RuntimeException("LabTest not found"));
        }

        mapper.updateMedicalAttachmentEntity(entity, requestDTO, labTest);
        repository.save(entity);
        return mapper.toMedicalAttachmentDTO(entity);
    }

    @Override
    public void delete(UUID id) {
        if (!repository.existsById(id)) {
            throw new RuntimeException("MedicalAttachment not found");
        }
        repository.deleteById(id);
    }

    @Override
    public MedicalAttachmentDTO getById(UUID id) {
        return repository.findById(id)
                .map(mapper::toMedicalAttachmentDTO)
                .orElseThrow(() -> new RuntimeException("MedicalAttachment not found"));
    }

    @Override
    public List<MedicalAttachmentDTO> getAll() {
        return repository.findAll()
                .stream()
                .map(mapper::toMedicalAttachmentDTO)
                .collect(Collectors.toList());
    }

    @Override
    public List<MedicalAttachmentDTO> getByLabTest(UUID labTestId) {
        return repository.findByLabTest_Id(labTestId)
                .stream()
                .map(mapper::toMedicalAttachmentDTO)
                .collect(Collectors.toList());
    }

    @Override
    public List<MedicalAttachmentDTO> searchByType(String type) {
        return repository.findByTypeContainingIgnoreCase(type)
                .stream()
                .map(mapper::toMedicalAttachmentDTO)
                .collect(Collectors.toList());
    }
}
