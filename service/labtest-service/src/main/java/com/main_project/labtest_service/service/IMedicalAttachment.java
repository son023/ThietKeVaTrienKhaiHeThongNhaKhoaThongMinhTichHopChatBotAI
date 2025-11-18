package com.main_project.labtest_service.service;

import com.main_project.labtest_service.dto.MedicalAttachmentDTO;
import com.main_project.labtest_service.dto.MedicalAttachmentRequestDTO;

import java.util.List;
import java.util.UUID;

public interface IMedicalAttachment {
    MedicalAttachmentDTO create(MedicalAttachmentRequestDTO requestDTO);
    MedicalAttachmentDTO update(UUID id, MedicalAttachmentRequestDTO requestDTO);
    void delete(UUID id);
    MedicalAttachmentDTO getById(UUID id);
    List<MedicalAttachmentDTO> getAll();
    List<MedicalAttachmentDTO> getByLabTest(UUID labTestId);
    List<MedicalAttachmentDTO> searchByType(String type);
}
