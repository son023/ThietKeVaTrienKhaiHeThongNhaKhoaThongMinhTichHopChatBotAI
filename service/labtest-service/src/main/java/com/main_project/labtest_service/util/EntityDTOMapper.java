package com.main_project.labtest_service.util;

import com.main_project.labtest_service.dto.*;
import com.main_project.labtest_service.entity.LabTechnician;
import com.main_project.labtest_service.entity.LabTest;
import com.main_project.labtest_service.entity.LabTestType;
import com.main_project.labtest_service.entity.MedicalAttachment;
import com.main_project.labtest_service.feignclient.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.time.ZonedDateTime;
import java.util.Objects;
import java.util.UUID;
import java.util.stream.Collectors;

@Slf4j
@Component
@RequiredArgsConstructor
public class EntityDTOMapper {
    private final UserServiceClient userServiceClient;
    private final DoctorServiceClient doctorServiceClient;
    private final AppointmentServiceClient appointmentServiceClient;
    private final PatientServiceClient patientServiceClient;
    // ===================
    // LabTest
    // ===================
    public LabTestDTO toLabTestDTO(LabTest entity) {
        if (entity == null) return null;

        LabTestDTO dto = new LabTestDTO();
        dto.setId(entity.getId());
        dto.setAppointmentId(entity.getAppointmentId());
        dto.setMedicalHistoryId(entity.getMedicalHistoryId());
        if (entity.getLabTechnician() != null) {
            dto.setLabTechnicianId(entity.getLabTechnician().getUserId());
            try {
                var user = userServiceClient.getUserById(entity.getLabTechnician().getUserId());
                if (user != null && user.getFullname() != null) {
                    dto.setLabTechnicianName(user.getFullname());
                } else {
                    dto.setLabTechnicianName(entity.getLabTechnician().getUserId().toString());
                }
            } catch (Exception e) {
                log.warn("Failed to fetch lab technician name for userId: {}, using ID as fallback", entity.getLabTechnician().getUserId(), e);
                dto.setLabTechnicianName(entity.getLabTechnician().getUserId().toString());
            }
        }
        dto.setDoctorId(entity.getDoctorId());
        if (entity.getDoctorId() != null) {
            try {
                var doctor = doctorServiceClient.getDoctorById(entity.getDoctorId());
                if (doctor != null && doctor.getUserId() != null) {
                    var user = userServiceClient.getUserById(doctor.getUserId());
                    if (user != null && user.getFullname() != null) {
                        dto.setDoctorName(user.getFullname());
                    }
                }
            } catch (Exception e) {
                log.warn("Failed to fetch doctor name for doctorId: {}", entity.getDoctorId(), e);
            }
        }
        dto.setPrice(entity.getPrice());
        dto.setInstructions(entity.getInstructions());
        dto.setStatus(entity.getStatus());
        dto.setResultDate(entity.getResultDate());
        dto.setAbnormalFlag(entity.getAbnormalFlag());
        dto.setUnits(entity.getUnits());
        dto.setStructureJson(entity.getStructureJson());
        dto.setReferenceRange(entity.getReferenceRange());
        dto.setCreatedAt(entity.getCreatedAt());
        dto.setUpdatedAt(entity.getUpdatedAt());

        if (entity.getAppointmentId() != null) {
            try {
                log.debug("Fetching appointment for appointmentId: {}", entity.getAppointmentId());
                var appointment = appointmentServiceClient.getAppointmentById(entity.getAppointmentId());
                if (appointment != null && appointment.getPatientId() != null) {
                    log.debug("Appointment found, patientId (userId): {}", appointment.getPatientId());
                    var user = userServiceClient.getUserById(appointment.getPatientId());
                    if (user != null && user.getFullname() != null) {
                        dto.setPatientName(user.getFullname());
                        log.debug("Patient name set: {}", user.getFullname());
                    } else {
                        log.warn("User not found or fullname is null for patientId (userId): {}", appointment.getPatientId());
                    }
                } else {
                    if (appointment == null) {
                        log.warn("Appointment not found for appointmentId: {}", entity.getAppointmentId());
                    } else {
                        log.warn("Appointment has no patientId for appointmentId: {}", entity.getAppointmentId());
                    }
                }
            } catch (Exception e) {
                log.error("Failed to fetch patient name for appointmentId: {}", entity.getAppointmentId(), e);
            }
        } else {
            log.debug("LabTest has no appointmentId, skipping patient name fetch");
        }

        if (entity.getLabTestType() != null) {
            dto.setLabTestTypeId(entity.getLabTestType().getId());
            dto.setLabTestType(toLabTestTypeDTO(entity.getLabTestType()));
        }

        if (entity.getMedicalAttachments() != null && !entity.getMedicalAttachments().isEmpty()) {
            dto.setMedicalAttachmentIds(
                    entity.getMedicalAttachments().stream()
                            .filter(Objects::nonNull)
                            .map(MedicalAttachment::getId)
                            .collect(Collectors.toList())
            );
            dto.setMedicalAttachments(
                    entity.getMedicalAttachments().stream()
                            .filter(Objects::nonNull)
                            .map(this::toMedicalAttachmentDTO)
                            .collect(Collectors.toList())
            );
        }

        return dto;
    }

    // RequestDTO -> Entity
    public LabTest toLabTestEntity(LabTestRequestDTO requestDTO, LabTestType labTestType, LabTechnician labTechnician) {
        if (requestDTO == null) return null;

        LabTest entity = new LabTest();
        entity.setAppointmentId(requestDTO.getAppointmentId());
        entity.setMedicalHistoryId(requestDTO.getMedicalHistoryId());
        entity.setDoctorId(requestDTO.getDoctorId());
        entity.setPrice(requestDTO.getPrice());
        entity.setInstructions(requestDTO.getInstructions());
        entity.setStatus(requestDTO.getStatus());
        entity.setAbnormalFlag(requestDTO.getAbnormalFlag());
        entity.setUnits(requestDTO.getUnits());
        entity.setStructureJson(requestDTO.getStructureJson());
        entity.setReferenceRange(requestDTO.getReferenceRange());
        entity.setLabTestType(labTestType);
        entity.setLabTechnician(labTechnician);
        entity.setCreatedAt(ZonedDateTime.now());
        entity.setUpdatedAt(ZonedDateTime.now());

        if (requestDTO.getResultDate() != null) {
            entity.setResultDate(requestDTO.getResultDate());
        }

        return entity;
    }

    // ===================
    // LabTestType
    // ===================
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

    // ===================
    // MedicalAttachment
    // ===================
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

    public MedicalAttachment toMedicalAttachmentEntity(MedicalAttachmentRequestDTO dto, LabTest labTest) {
        if (dto == null) return null;

        return MedicalAttachment.builder()
                .filePath(dto.getFilePath())
                .type(dto.getType())
                .labTest(labTest)
                .build();
    }

    public void updateMedicalAttachmentEntity(MedicalAttachment entity, MedicalAttachmentRequestDTO dto, LabTest labTest) {
        if (dto == null || entity == null) return;

        if (dto.getFilePath() != null) entity.setFilePath(dto.getFilePath());
        if (dto.getType() != null) entity.setType(dto.getType());
        if (labTest != null) entity.setLabTest(labTest);
        entity.setUpdatedAt(ZonedDateTime.now());
    }

    // ===================
    // LabTechnician
    // ===================
    public LabTechnicianDTO toLabTechnicianDTO(LabTechnician entity) {
        if (entity == null) return null;
        return LabTechnicianDTO.builder()
                .userId(entity.getUserId())
                .licenseNumber(entity.getLicenseNumber())
                .build();
    }

    public LabTechnician toLabTechnicianEntity(LabTechnicianRequestDTO dto) {
        if (dto == null) return null;
        return LabTechnician.builder()
                .userId(dto.getUserId())
                .licenseNumber(dto.getLicenseNumber())
                .build();
    }

    public void updateLabTechnicianEntity(LabTechnician entity, LabTechnicianRequestDTO dto) {
        if (entity == null || dto == null) return;
        entity.setLicenseNumber(dto.getLicenseNumber());
    }
}
