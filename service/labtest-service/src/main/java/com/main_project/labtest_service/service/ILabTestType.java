package com.main_project.labtest_service.service;

import com.main_project.labtest_service.dto.LabTestTypeDTO;
import com.main_project.labtest_service.dto.LabTestTypeRequestDTO;

import java.util.List;
import java.util.UUID;

public interface ILabTestType {
    LabTestTypeDTO create(LabTestTypeRequestDTO requestDTO);
    LabTestTypeDTO update(UUID id, LabTestTypeRequestDTO requestDTO);
    void delete(UUID id);
    LabTestTypeDTO getById(UUID id);
    List<LabTestTypeDTO> getAll();
    List<LabTestTypeDTO> searchByName(String name);
}
