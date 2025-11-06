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

    List<DoctorWorkScheduleDTO> getDoctorWorkSchedulesByDate(ZonedDateTime date);

    List<DoctorWorkScheduleDTO> getDoctorWorkSchedulesBetween(ZonedDateTime start, ZonedDateTime end);

    List<DoctorWorkScheduleDTO> getDoctorWorkSchedulesByWorkScheduleId(UUID workScheduleId);

    long countDoctorWorkSchedulesByDoctorId(UUID doctorId);

    DoctorWorkScheduleDTO createDoctorWorkSchedule(DoctorWorkScheduleRequestDTO requestDTO);

    DoctorWorkScheduleDTO updateDoctorWorkSchedule(UUID id, DoctorWorkScheduleRequestDTO requestDTO);

    void deleteDoctorWorkSchedule(UUID id);

    void deleteDoctorWorkSchedulesByDoctorId(UUID doctorId);
}
