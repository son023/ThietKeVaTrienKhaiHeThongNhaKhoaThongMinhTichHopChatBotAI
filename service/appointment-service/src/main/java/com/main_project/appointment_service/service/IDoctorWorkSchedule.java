package com.main_project.appointment_service.service;

import com.main_project.appointment_service.dto.DoctorWorkScheduleDTO;
import com.main_project.appointment_service.dto.DoctorWorkScheduleRequestDTO;

import java.time.ZonedDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface IDoctorWorkSchedule {
    List<DoctorWorkScheduleDTO> getAllDoctorWorkSchedules();
    Optional<DoctorWorkScheduleDTO> getDoctorWorkScheduleById(UUID id);

    List<DoctorWorkScheduleDTO> getDoctorWorkSchedulesByDoctorId(UUID doctorId);
    List<DoctorWorkScheduleDTO> getDoctorWorkSchedulesByStatus(String status);
    List<DoctorWorkScheduleDTO> getDoctorWorkSchedulesByWorkScheduleId(UUID workScheduleId);

    List<DoctorWorkScheduleDTO> getDoctorWorkSchedulesByDate(ZonedDateTime date);
    List<DoctorWorkScheduleDTO> getDoctorWorkSchedulesBetween(ZonedDateTime start, ZonedDateTime end);

    DoctorWorkScheduleDTO createDoctorWorkSchedule(DoctorWorkScheduleRequestDTO requestDTO);
    DoctorWorkScheduleDTO updateDoctorWorkSchedule(UUID id, DoctorWorkScheduleRequestDTO requestDTO);
    DoctorWorkScheduleDTO updateDoctorWorkScheduleStatus(UUID id, String status);

    void deleteDoctorWorkSchedule(UUID id);
}
