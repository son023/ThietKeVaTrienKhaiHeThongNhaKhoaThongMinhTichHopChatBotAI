package com.main_project.appointment_service.util;

import com.main_project.appointment_service.dto.*;
import com.main_project.appointment_service.entity.Appointment;
import com.main_project.appointment_service.entity.DoctorWorkSchedule;
import com.main_project.appointment_service.entity.MedicalService;
import com.main_project.appointment_service.entity.WorkSchedule;
import org.springframework.stereotype.Component;

import java.time.ZonedDateTime;
import java.util.List;
import java.util.UUID;

@Component
public class EntityDTOMapper {

    // ========================
    // 🔹 Appointment → DTO
    // ========================
    public AppointmentDTO toAppointmentDTO(Appointment entity) {
        if (entity == null) return null;

        AppointmentDTO dto = new AppointmentDTO();
        dto.setId(entity.getId());
        dto.setDoctorId(entity.getDoctorId());
        dto.setPatientId(entity.getPatientId());
        dto.setAppointmentStartTime(entity.getAppointmentStartTime());
        dto.setAppointmentEndTime(entity.getAppointmentEndTime());
        dto.setStatus(entity.getStatus());
        dto.setCreatedAt(entity.getCreatedAt());
        dto.setUpdatedAt(entity.getUpdatedAt());

        // 🔹 mapping danh sách dịch vụ y tế Many-to-Many
        if (entity.getMedicalServices() != null && !entity.getMedicalServices().isEmpty()) {
            List<MedicalServiceDTO> serviceDTOs = entity.getMedicalServices().stream()
                    .map(ms -> {
                        MedicalServiceDTO msDTO = new MedicalServiceDTO();
                        msDTO.setId(ms.getId());
                        msDTO.setServiceName(ms.getServiceName());
                        msDTO.setServiceType(ms.getServiceType());
                        msDTO.setServiceTime(ms.getServiceTime());
                        msDTO.setStatus(ms.getStatus());
                        msDTO.setPrice(ms.getPrice());
                        return msDTO;
                    }).toList();
            dto.setMedicalServices(serviceDTOs);
        } else {
            dto.setMedicalServices(List.of());
        }

        return dto;
    }

    // ========================
    // 🔹 RequestDTO → Appointment Entity
    // ========================
    public Appointment toAppointmentEntity(AppointmentRequestDTO requestDTO, List<MedicalService> medicalServices) {
        if (requestDTO == null) return null;

        Appointment entity = new Appointment();
        entity.setDoctorId(requestDTO.getDoctorId());
        entity.setPatientId(requestDTO.getPatientId());
        entity.setAppointmentStartTime(requestDTO.getAppointmentStartTime());
        entity.setAppointmentEndTime(requestDTO.getAppointmentEndTime());
        entity.setStatus(requestDTO.getStatus());
        entity.setCreatedAt(ZonedDateTime.now());
        entity.setUpdatedAt(ZonedDateTime.now());

        // 🔹 gán danh sách MedicalService trực tiếp
        entity.setMedicalServices(medicalServices);


        return entity;
    }

    // ========================
    // 🔹 Update Entity từ RequestDTO
    // ========================
    public void updateAppointmentEntity(Appointment entity, AppointmentRequestDTO requestDTO, List<MedicalService> medicalServices) {
        if (entity == null || requestDTO == null) return;

        entity.setDoctorId(requestDTO.getDoctorId());
        entity.setPatientId(requestDTO.getPatientId());
        entity.setAppointmentStartTime(requestDTO.getAppointmentStartTime());
        entity.setAppointmentEndTime(requestDTO.getAppointmentEndTime());
        entity.setStatus(requestDTO.getStatus());
        entity.setUpdatedAt(ZonedDateTime.now());

        // 🔹 cập nhật danh sách MedicalService
        if (medicalServices != null) {
            entity.setMedicalServices(medicalServices);
        } else {
            entity.setMedicalServices(List.of());
        }
    }

    // ======================
    // 🔹 MedicalService Mapping
    // ======================

    public MedicalServiceDTO toMedicalServiceDTO(MedicalService entity) {
        if (entity == null) return null;

        MedicalServiceDTO dto = new MedicalServiceDTO();
        dto.setId(entity.getId());
        dto.setServiceName(entity.getServiceName());
        dto.setServiceType(entity.getServiceType());
        dto.setServiceTime(entity.getServiceTime());
        dto.setStatus(entity.getStatus());
        dto.setPrice(entity.getPrice());
        return dto;
    }

    public MedicalService toMedicalServiceEntity(MedicalServiceRequestDTO requestDTO) {
        if (requestDTO == null) return null;

        MedicalService entity = new MedicalService();
        entity.setServiceName(requestDTO.getServiceName());
        entity.setServiceType(requestDTO.getServiceType());
        entity.setServiceTime(requestDTO.getServiceTime());
        entity.setStatus(requestDTO.getStatus());
        entity.setPrice(requestDTO.getPrice());
        return entity;
    }

    public void updateMedicalServiceEntity(MedicalService entity, MedicalServiceRequestDTO requestDTO) {
        if (entity == null || requestDTO == null) return;

        entity.setServiceName(requestDTO.getServiceName());
        entity.setServiceType(requestDTO.getServiceType());
        entity.setServiceTime(requestDTO.getServiceTime());
        entity.setStatus(requestDTO.getStatus());
        entity.setPrice(requestDTO.getPrice());
    }
    // ======================
    // 🔹 WorkSchedule Mapping
    // ======================

    public WorkScheduleDTO toWorkScheduleDTO(WorkSchedule entity) {
        if (entity == null) return null;

        WorkScheduleDTO dto = new WorkScheduleDTO();
        dto.setId(entity.getId());
        dto.setWorkDate(entity.getWorkDate());
        dto.setStartTime(entity.getStartTime());
        dto.setEndTime(entity.getEndTime());
        return dto;
    }

    public WorkSchedule toWorkScheduleEntity(WorkScheduleRequestDTO requestDTO) {
        if (requestDTO == null) return null;

        WorkSchedule entity = new WorkSchedule();
        entity.setWorkDate(requestDTO.getWorkDate());
        entity.setStartTime(requestDTO.getStartTime());
        entity.setEndTime(requestDTO.getEndTime());
        return entity;
    }

    public void updateWorkScheduleEntity(WorkSchedule entity, WorkScheduleRequestDTO requestDTO) {
        if (entity == null || requestDTO == null) return;

        entity.setWorkDate(requestDTO.getWorkDate());
        entity.setStartTime(requestDTO.getStartTime());
        entity.setEndTime(requestDTO.getEndTime());
    }

    // ================================
    // 🔹 DoctorWorkSchedule Mapping
    // ================================

    public DoctorWorkScheduleDTO toDoctorWorkScheduleDTO(DoctorWorkSchedule entity) {
        if (entity == null) return null;

        DoctorWorkScheduleDTO dto = new DoctorWorkScheduleDTO();
        dto.setId(entity.getId());
        dto.setDoctorId(entity.getDoctorId());
        dto.setStatus(entity.getStatus());
        dto.setCreatedAt(entity.getCreatedAt());
        dto.setUpdatedAt(entity.getUpdatedAt());
        dto.setWorkSchedule(null);

        if (entity.getWorkSchedule() != null) {
            dto.setWorkScheduleId(entity.getWorkSchedule().getId());
            dto.setWorkSchedule(toWorkScheduleDTO(entity.getWorkSchedule()));
        }

        return dto;
    }

    public DoctorWorkSchedule toDoctorWorkScheduleEntity(DoctorWorkScheduleRequestDTO requestDTO, WorkSchedule workSchedule) {
        if (requestDTO == null) return null;

        DoctorWorkSchedule entity = new DoctorWorkSchedule();
        entity.setDoctorId(requestDTO.getDoctorId());
        entity.setCreatedAt(requestDTO.getCreatedAt());
        entity.setUpdatedAt(requestDTO.getUpdatedAt());
        entity.setWorkSchedule(workSchedule);
        return entity;
    }

    public void updateDoctorWorkScheduleEntity(DoctorWorkSchedule entity, DoctorWorkScheduleRequestDTO requestDTO, WorkSchedule workSchedule) {
        if (entity == null || requestDTO == null) return;

        entity.setDoctorId(requestDTO.getDoctorId());
        entity.setCreatedAt(requestDTO.getCreatedAt());
        entity.setUpdatedAt(requestDTO.getUpdatedAt());
        entity.setWorkSchedule(workSchedule);
    }


}
