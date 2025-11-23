package com.main_project.doctor_service.service;

import com.main_project.doctor_service.dto.WorkScheduleRequestDTO;
import com.main_project.doctor_service.dto.WorkScheduleResponseDTO;

import java.util.List;

public interface IWorkScheduleService {
    WorkScheduleResponseDTO createWorkSchedule(WorkScheduleRequestDTO request);

    List<WorkScheduleResponseDTO> getAllWorkSchedules();

    WorkScheduleResponseDTO getWorkScheduleById(String id);

    WorkScheduleResponseDTO updateWorkSchedule(String id, WorkScheduleRequestDTO request);

    void deleteWorkSchedule(String id);
}
