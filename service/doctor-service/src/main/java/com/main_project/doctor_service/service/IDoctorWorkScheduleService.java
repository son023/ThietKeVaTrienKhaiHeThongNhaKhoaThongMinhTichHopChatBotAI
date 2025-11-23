package com.main_project.doctor_service.service;

import com.main_project.doctor_service.dto.DoctorWorkScheduleRequestDTO;
import com.main_project.doctor_service.dto.DoctorWorkScheduleResponseDTO;

import java.util.List;

public interface IDoctorWorkScheduleService {
    DoctorWorkScheduleResponseDTO createDoctorWorkSchedule(DoctorWorkScheduleRequestDTO request);

    List<DoctorWorkScheduleResponseDTO> getAllDoctorWorkSchedules();

    DoctorWorkScheduleResponseDTO getDoctorWorkScheduleById(String id);

    List<DoctorWorkScheduleResponseDTO> getDoctorWorkSchedulesByDoctorId(String doctorId);

    DoctorWorkScheduleResponseDTO updateDoctorWorkSchedule(String id, DoctorWorkScheduleRequestDTO request);

    void deleteDoctorWorkSchedule(String id);
}
