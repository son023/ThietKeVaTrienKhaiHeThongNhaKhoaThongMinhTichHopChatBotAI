package com.main_project.doctor_service.service;

import com.main_project.doctor_service.dto.DoctorDegreeRequestDTO;
import com.main_project.doctor_service.dto.DoctorDegreeResponseDTO;

import java.util.List;
import java.util.UUID;

public interface IDoctorDegreeService {
    DoctorDegreeResponseDTO createDoctorDegree(DoctorDegreeRequestDTO request);

    List<DoctorDegreeResponseDTO> getAllDoctorDegrees();

    DoctorDegreeResponseDTO getDoctorDegreeById(UUID id);

    List<DoctorDegreeResponseDTO> getDegreesByDoctorId(UUID doctorId);

    DoctorDegreeResponseDTO updateDoctorDegree(UUID id, DoctorDegreeRequestDTO request);

    void deleteDoctorDegree(UUID id);
}
