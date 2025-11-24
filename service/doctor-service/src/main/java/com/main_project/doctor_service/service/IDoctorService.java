package com.main_project.doctor_service.service;

import com.main_project.doctor_service.dto.DoctorRequestDTO;
import com.main_project.doctor_service.dto.DoctorResponseDTO;

import java.util.List;

public interface IDoctorService {
    DoctorResponseDTO createDoctor(DoctorRequestDTO request);

    List<DoctorResponseDTO> getAllDoctors();

    DoctorResponseDTO getDoctorById(String userId);

    DoctorResponseDTO updateDoctor(String userId, DoctorRequestDTO request);

    void deleteDoctor(String userId);
}
