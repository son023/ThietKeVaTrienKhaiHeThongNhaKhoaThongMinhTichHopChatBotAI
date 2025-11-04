package com.main_project.appointment_service.util;

import com.main_project.appointment_service.dto.DoctorWorkScheduleDTO;
import com.main_project.appointment_service.dto.DoctorWorkScheduleRequestDTO;
import com.main_project.appointment_service.dto.WorkScheduleDTO;
import com.main_project.appointment_service.dto.WorkScheduleRequestDTO;
import com.main_project.appointment_service.entity.DoctorWorkSchedule;
import com.main_project.appointment_service.entity.WorkSchedule;

public class EntityDTOMapper {
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
        entity.setWorkDate(requestDTO.getWorkDate());
        entity.setStartTime(requestDTO.getStartTime());
        entity.setEndTime(requestDTO.getEndTime());
        entity.setAvailable(requestDTO.isAvailable());
        entity.setWorkSchedule(workSchedule);
        return entity;
    }

    public void updateDoctorWorkScheduleEntity(DoctorWorkSchedule entity, DoctorWorkScheduleRequestDTO requestDTO, WorkSchedule workSchedule) {
        if (entity == null || requestDTO == null) return;

        entity.setDoctorId(requestDTO.getDoctorId());
        entity.setWorkDate(requestDTO.getWorkDate());
        entity.setStartTime(requestDTO.getStartTime());
        entity.setEndTime(requestDTO.getEndTime());
        entity.setAvailable(requestDTO.isAvailable());
        entity.setWorkSchedule(workSchedule);
    }
}
