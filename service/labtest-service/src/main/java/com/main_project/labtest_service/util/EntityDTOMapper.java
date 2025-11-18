package com.main_project.labtest_service.util;

import com.main_project.labtest_service.dto.*;
import com.main_project.labtest_service.entity.LabTest;
import com.main_project.labtest_service.entity.LabTestType;
import com.main_project.labtest_service.entity.MedicalAttachment;
import com.main_project.labtest_service.entity.MedicalHistory;
import org.springframework.stereotype.Component;

import java.time.ZonedDateTime;
import java.util.Objects;
import java.util.UUID;
import java.util.stream.Collectors;

@Component
public class EntityDTOMapper {
    // 🔹 Entity → DTO
    public LabTestDTO toLabTestDTO(LabTest entity) {
        if (entity == null) return null;

        LabTestDTO dto = new LabTestDTO();
        dto.setId(entity.getId());
        dto.setLabTechnicianId(entity.getLabTechnicianId());
        dto.setDoctorId(entity.getDoctorId());
        dto.setPrice(entity.getPrice());
        dto.setInstructions(entity.getInstructions());
        dto.setStatus(entity.getStatus());
        dto.setResultDate(entity.getResultDate() != null ? entity.getResultDate() : null);
        dto.setAbnormalFlag(entity.getAbnormalFlag());
        dto.setUnits(entity.getUnits());
        dto.setStructureJson(entity.getStructureJson());
        dto.setReferenceRange(entity.getReferenceRange());
        dto.setCreatedAt(entity.getCreatedAt() != null ? entity.getCreatedAt(): null);
        dto.setUpdatedAt(entity.getUpdatedAt() != null ? entity.getUpdatedAt() : null);

        if (entity.getMedicalHistory() != null) {
            dto.setMedicalHistoryId(entity.getMedicalHistory().getId());
        }

        if (entity.getLabTestType() != null) {
            dto.setLabTestTypeId(entity.getLabTestType().getId());
        }

        if (entity.getMedicalAttachments() != null) {
            dto.setMedicalAttachmentIds(
                    entity.getMedicalAttachments().stream()
                            .filter(Objects::nonNull)
                            .map(MedicalAttachment::getId)
                            .collect(Collectors.toList())
            );
        }

        return dto;
    }

    // 🔹 RequestDTO → Entity
    public LabTest toLabTestEntity(LabTestRequestDTO requestDTO, MedicalHistory medicalHistory, LabTestType labTestType) {
        if (requestDTO == null) return null;

        LabTest entity = new LabTest();
        entity.setLabTechnicianId(requestDTO.getLabTechnicianId());
        entity.setDoctorId(requestDTO.getDoctorId());
        entity.setPrice(requestDTO.getPrice());
        entity.setInstructions(requestDTO.getInstructions());
        entity.setStatus(requestDTO.getStatus());
        entity.setAbnormalFlag(requestDTO.getAbnormalFlag());
        entity.setUnits(requestDTO.getUnits());
        entity.setStructureJson(requestDTO.getStructureJson());
        entity.setReferenceRange(requestDTO.getReferenceRange());
        entity.setMedicalHistory(medicalHistory);
        entity.setLabTestType(labTestType);
        entity.setCreatedAt(java.time.ZonedDateTime.now());
        entity.setUpdatedAt(java.time.ZonedDateTime.now());

        if (requestDTO.getResultDate() != null) {
            entity.setResultDate(requestDTO.getResultDate());
        }

        return entity;
    }

    public LabTestTypeDTO toLabTestTypeDTO(LabTestType entity) {
        if (entity == null) return null;

        return LabTestTypeDTO.builder()
                .id(entity.getId())
                .name(entity.getName())
                .description(entity.getDescription())
                .build();
    }

    public LabTestType toLabTestTypeEntity(LabTestTypeRequestDTO dto) {
        if (dto == null) return null;

        return LabTestType.builder()
                .id(UUID.randomUUID())
                .name(dto.getName())
                .description(dto.getDescription())
                .build();
    }

    public void updateLabTestTypeEntity(LabTestType entity, LabTestTypeRequestDTO dto) {
        if (dto == null || entity == null) return;

        if (dto.getName() != null) entity.setName(dto.getName());
        if (dto.getDescription() != null) entity.setDescription(dto.getDescription());
    }

    public MedicalAttachmentDTO toMedicalAttachmentDTO(MedicalAttachment entity) {
        if (entity == null) return null;

        return MedicalAttachmentDTO.builder()
                .id(entity.getId())
                .filePath(entity.getFilePath())
                .type(entity.getType())
                .createdAt(entity.getCreatedAt())
                .updatedAt(entity.getUpdatedAt())
                .labTestId(entity.getLabTest() != null ? entity.getLabTest().getId() : null)
                .build();
    }

    public MedicalAttachment toEntity(MedicalAttachmentRequestDTO dto, LabTest labTest) {
        if (dto == null) return null;

        return MedicalAttachment.builder()
                .filePath(dto.getFilePath())
                .type(dto.getType())
                .createdAt(ZonedDateTime.now())
                .updatedAt(ZonedDateTime.now())
                .labTest(labTest)
                .build();
    }

    public void updateEntity(MedicalAttachment entity, MedicalAttachmentRequestDTO dto, LabTest labTest) {
        if (dto == null || entity == null) return;

        if (dto.getFilePath() != null) entity.setFilePath(dto.getFilePath());
        if (dto.getType() != null) entity.setType(dto.getType());
        if (labTest != null) entity.setLabTest(labTest);
        entity.setUpdatedAt(ZonedDateTime.now());
    }

    public MedicalHistoryDTO toMedicalHistoryDTO(MedicalHistory entity) {
        if (entity == null) return null;

        MedicalHistoryDTO dto = new MedicalHistoryDTO();
        dto.setId(entity.getId());
        dto.setAppointmentId(entity.getAppointmentId());
        dto.setSymptoms(entity.getSymptoms());
        dto.setTreatment(entity.getTreatment());
        dto.setDiagnosis(entity.getDiagnosis());
        dto.setDisease(entity.getDisease());
        dto.setCreatedAt(entity.getCreatedAt());
        dto.setUpdatedAt(entity.getUpdatedAt());

        if (entity.getLabTests() != null)
            dto.setLabTestIds(entity.getLabTests().stream()
                    .map(l -> l.getId())
                    .collect(Collectors.toList()));

        return dto;
    }

    public MedicalHistory toMedicalHistoryEntity(MedicalHistoryRequestDTO requestDTO) {
        if (requestDTO == null) return null;

        return MedicalHistory.builder()
                .appointmentId(requestDTO.getAppointmentId())
                .symptoms(requestDTO.getSymptoms())
                .treatment(requestDTO.getTreatment())
                .diagnosis(requestDTO.getDiagnosis())
                .disease(requestDTO.getDisease())
                .build();
    }
}
