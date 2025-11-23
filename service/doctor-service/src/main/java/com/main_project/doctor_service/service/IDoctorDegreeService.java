package com.main_project.doctor_service.service;

import com.main_project.doctor_service.dto.DoctorDegreeRequestDTO;
import com.main_project.doctor_service.dto.DoctorDegreeResponseDTO;

import java.util.List;

public interface IDoctorDegreeService {
    DoctorDegreeResponseDTO createDoctorDegree(DoctorDegreeRequestDTO request);

    List<DoctorDegreeResponseDTO> getAllDoctorDegrees();

    DoctorDegreeResponseDTO getDoctorDegreeById(String id);

    List<DoctorDegreeResponseDTO> getDegreesByDoctorId(String doctorId);

    DoctorDegreeResponseDTO updateDoctorDegree(String id, DoctorDegreeRequestDTO request);

    void deleteDoctorDegree(String id);
}
