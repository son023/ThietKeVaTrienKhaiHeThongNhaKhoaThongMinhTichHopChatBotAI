package com.main_project.labtest_service.service;

import com.main_project.labtest_service.dto.LabTechnicianDTO;
import com.main_project.labtest_service.dto.LabTechnicianRequestDTO;

import java.util.List;
import java.util.UUID;

public interface ILabTechnicianService {
    LabTechnicianDTO createLabTechnician(LabTechnicianRequestDTO request);
    LabTechnicianDTO getLabTechnicianById(UUID userId);
    List<LabTechnicianDTO> getAllLabTechnicians();
    LabTechnicianDTO updateLabTechnician(UUID userId, LabTechnicianRequestDTO request);
    void deleteLabTechnician(UUID userId);
}
