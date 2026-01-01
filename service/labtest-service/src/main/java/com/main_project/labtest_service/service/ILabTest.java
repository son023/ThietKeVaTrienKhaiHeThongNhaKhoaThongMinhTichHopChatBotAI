package com.main_project.labtest_service.service;

import com.main_project.labtest_service.dto.LabTestDTO;
import com.main_project.labtest_service.dto.LabTestRequestDTO;

import java.util.List;
import java.util.UUID;

public interface ILabTest {
    LabTestDTO createLabTest(LabTestRequestDTO requestDTO);
    LabTestDTO requestLabTest(LabTestRequestDTO requestDTO);
    LabTestDTO updateLabTest(UUID id, LabTestRequestDTO requestDTO);
    LabTestDTO acceptLabTest(UUID id, UUID labTechnicianId);
    LabTestDTO startLabTest(UUID id);
    LabTestDTO completeLabTest(UUID id, LabTestRequestDTO dto);
    void deleteLabTest(UUID id);
    LabTestDTO getLabTestById(UUID id);
    List<LabTestDTO> getAllLabTests();
    List<LabTestDTO> getLabTestsByDoctorId(UUID doctorId);
    List<LabTestDTO> getLabTestsByLabTechnicianId(UUID labTechnicianId);
    List<LabTestDTO> getLabTestsByStatus(String status);
}
