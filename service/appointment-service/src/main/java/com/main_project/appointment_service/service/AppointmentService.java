package com.main_project.appointment_service.service;

import com.main_project.appointment_service.dto.AppointmentDTO;
import com.main_project.appointment_service.dto.AppointmentRequestDTO;
import com.main_project.appointment_service.entity.Appointment;
import com.main_project.appointment_service.enums.AppointmentStatus;
import com.main_project.appointment_service.repository.AppointmentRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.ZonedDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional
public class AppointmentService implements IAppointmentService {
    private final AppointmentRepository appointmentRepository;

    @Override
    public List<AppointmentDTO> getAllAppointments() {
        return List.of();
    }

    @Override
    public Optional<AppointmentDTO> getAppointmentById(UUID id) {
        return Optional.empty();
    }

    @Override
    public AppointmentDTO createAppointment(AppointmentRequestDTO requestDTO) {
        return null;
    }

    @Override
    public AppointmentDTO updateAppointment(UUID id, AppointmentRequestDTO requestDTO) {
        return null;
    }

    @Override
    public AppointmentDTO updateAppointmentStatus(UUID id, AppointmentStatus status) {
        return null;
    }

    @Override
    public void deleteAppointment(UUID id) {

    }

    @Override
    public List<AppointmentDTO> getAppointmentsByDoctorId(String doctorId) {
        return List.of();
    }

    @Override
    public List<AppointmentDTO> getAppointmentsByPatientId(String patientId) {
        return List.of();
    }

    @Override
    public List<AppointmentDTO> getAppointmentsByStatus(AppointmentStatus status) {
        return List.of();
    }

    @Override
    public List<AppointmentDTO> getAppointmentsByDate(ZonedDateTime date) {
        return List.of();
    }

    @Override
    public List<AppointmentDTO> getAppointmentsBetween(ZonedDateTime start, ZonedDateTime end) {
        return List.of();
    }

    @Override
    public long countAppointmentsByDoctorId(String doctorId) {
        return 0;
    }

    @Override
    public long countAppointmentsByPatientId(String patientId) {
        return 0;
    }
}
