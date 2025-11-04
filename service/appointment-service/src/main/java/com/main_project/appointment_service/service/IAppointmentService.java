package com.main_project.appointment_service.service;

import com.main_project.appointment_service.dto.AppointmentDTO;
import com.main_project.appointment_service.dto.AppointmentRequestDTO;
import com.main_project.appointment_service.enums.AppointmentStatus;

import java.time.ZonedDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface IAppointmentService {

    // CRUD cơ bản
    List<AppointmentDTO> getAllAppointments();

    Optional<AppointmentDTO> getAppointmentById(UUID id);

    AppointmentDTO createAppointment(AppointmentRequestDTO requestDTO);

    AppointmentDTO updateAppointment(UUID id, AppointmentRequestDTO requestDTO);

    AppointmentDTO updateAppointmentStatus(UUID id, AppointmentStatus status);

    void deleteAppointment(UUID id);

    // Truy vấn nâng cao
    List<AppointmentDTO> getAppointmentsByDoctorId(String doctorId);

    List<AppointmentDTO> getAppointmentsByPatientId(String patientId);

    List<AppointmentDTO> getAppointmentsByStatus(AppointmentStatus status);

    List<AppointmentDTO> getAppointmentsByDate(ZonedDateTime date);

    List<AppointmentDTO> getAppointmentsBetween(ZonedDateTime start, ZonedDateTime end);

    long countAppointmentsByDoctorId(String doctorId);

    long countAppointmentsByPatientId(String patientId);
}
