package com.main_project.appointment_service.service;

import com.main_project.appointment_service.dto.AppointmentDTO;
import com.main_project.appointment_service.dto.AppointmentRequestDTO;
import com.main_project.appointment_service.entity.Appointment;
import com.main_project.appointment_service.entity.MedicalService;
import com.main_project.appointment_service.enums.AppointmentStatus;
import com.main_project.appointment_service.repository.AppointmentRepository;
import com.main_project.appointment_service.repository.MedicalServiceRepository;
import com.main_project.appointment_service.util.EntityDTOMapper;
import org.springframework.transaction.annotation.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.ZonedDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class AppointmentService implements IAppointmentService {
    private final AppointmentRepository appointmentRepository;
    private final MedicalServiceRepository medicalServiceRepository;
    public final EntityDTOMapper mapper;

    @Override
    @Transactional(readOnly = true)
    public List<AppointmentDTO> getAllAppointments() {
        return appointmentRepository.findAll()
                .stream()
                .map(mapper::toAppointmentDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<AppointmentDTO> getAppointmentById(UUID id) {
        return appointmentRepository.findById(id)
                .map(mapper::toAppointmentDTO);
    }

    @Override
    @Transactional(readOnly = true)
    public List<AppointmentDTO> getAppointmentsByDoctorId(UUID doctorId) {
        return appointmentRepository.findByDoctorId(doctorId)
                .stream()
                .map(mapper::toAppointmentDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<AppointmentDTO> getAppointmentsByPatientId(UUID patientId) {
        return appointmentRepository.findByPatientId(patientId)
                .stream()
                .map(mapper::toAppointmentDTO)
                .collect(Collectors.toList());
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
    @Transactional(readOnly = true)
    public List<AppointmentDTO> getAppointmentsByStatus(AppointmentStatus status) {
        return appointmentRepository.findByStatus(status)
                .stream()
                .map(mapper::toAppointmentDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public long countAppointmentsByDoctorId(UUID doctorId) {
        return appointmentRepository.countByDoctorId(doctorId);
    }

    @Override
    public long countAppointmentsByPatientId(UUID patientId) {
        return 0;
    }

    @Override
    public AppointmentDTO createAppointment(AppointmentRequestDTO requestDTO) {
        MedicalService medicalService = medicalServiceRepository.findById(requestDTO.getMedicalServiceId())
                .orElseThrow(() -> new RuntimeException("Medical service not found with id: " + requestDTO.getMedicalServiceId()));

        Appointment appointment = mapper.toAppointmentEntity(requestDTO, medicalService);
        appointment.setCreatedAt(ZonedDateTime.now());
        appointment.setUpdatedAt(ZonedDateTime.now());

        Appointment saved = appointmentRepository.save(appointment);
        return mapper.toAppointmentDTO(saved);
    }

    @Override
    public AppointmentDTO updateAppointment(UUID id, AppointmentRequestDTO requestDTO) {
        Appointment existing = appointmentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Appointment not found with id: " + id));

        MedicalService medicalService = medicalServiceRepository.findById(requestDTO.getMedicalServiceId())
                .orElseThrow(() -> new RuntimeException("Medical service not found with id: " + requestDTO.getMedicalServiceId()));

        mapper.updateAppointmentEntity(existing, requestDTO, medicalService);
        existing.setUpdatedAt(ZonedDateTime.now());

        Appointment updated = appointmentRepository.save(existing);
        return mapper.toAppointmentDTO(updated);
    }

    @Override
    public AppointmentDTO updateAppointmentStatus(UUID id, AppointmentStatus status) {
        Appointment existing = appointmentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Appointment not found with id: " + id));

        existing.setStatus(status);
        existing.setUpdatedAt(ZonedDateTime.now());

        Appointment updated = appointmentRepository.save(existing);
        return mapper.toAppointmentDTO(updated);
    }

    @Override
    public void deleteAppointment(UUID id) {
        if (!appointmentRepository.existsById(id)) {
            throw new RuntimeException("Appointment not found with id: " + id);
        }
        appointmentRepository.deleteById(id);
    }

}
