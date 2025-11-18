package com.main_project.labtest_service.service;


import com.main_project.labtest_service.dto.LabTestTypeDTO;
import com.main_project.labtest_service.dto.LabTestTypeRequestDTO;
import com.main_project.labtest_service.entity.LabTestType;
import com.main_project.labtest_service.repository.LabTestTypeRepository;
import com.main_project.labtest_service.util.EntityDTOMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class LabTestTypeService implements ILabTestType {
    private final LabTestTypeRepository repository;
    private final EntityDTOMapper mapper;

    @Override
    public LabTestTypeDTO create(LabTestTypeRequestDTO requestDTO) {
        LabTestType entity = mapper.toLabTestTypeEntity(requestDTO);
        repository.save(entity);
        return mapper.toLabTestTypeDTO(entity);
    }

    @Override
    public LabTestTypeDTO update(UUID id, LabTestTypeRequestDTO requestDTO) {
        LabTestType entity = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("LabTestType not found"));
        mapper.updateLabTestTypeEntity(entity, requestDTO);
        repository.save(entity);
        return mapper.toLabTestTypeDTO(entity);
    }

    @Override
    public void delete(UUID id) {
        if (!repository.existsById(id)) {
            throw new RuntimeException("LabTestType not found");
        }
        repository.deleteById(id);
    }

    @Override
    public LabTestTypeDTO getById(UUID id) {
        return repository.findById(id)
                .map(mapper::toLabTestTypeDTO)
                .orElseThrow(() -> new RuntimeException("LabTestType not found"));
    }

    @Override
    public List<LabTestTypeDTO> getAll() {
        return repository.findAll()
                .stream()
                .map(mapper::toLabTestTypeDTO)
                .collect(Collectors.toList());
    }

    @Override
    public List<LabTestTypeDTO> searchByName(String name) {
        return repository.findAll()
                .stream()
                .filter(t -> t.getName() != null && t.getName().toLowerCase().contains(name.toLowerCase()))
                .map(mapper::toLabTestTypeDTO)
                .collect(Collectors.toList());
    }
}
