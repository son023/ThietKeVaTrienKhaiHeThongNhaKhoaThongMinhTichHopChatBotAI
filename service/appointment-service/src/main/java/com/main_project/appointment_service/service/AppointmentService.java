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
    private final EntityDTOMapper mapper;

    @Override
    public List<AppointmentDTO> getAllAppointments() {
        return appointmentRepository.findAll()
                .stream()
                .map(mapper::toAppointmentDTO)
                .collect(Collectors.toList());
    }

    @Override
    public Optional<AppointmentDTO> getAppointmentById(UUID id) {
        return appointmentRepository.findById(id)
                .map(mapper::toAppointmentDTO);
    }

    @Override
    public List<AppointmentDTO> getAppointmentsByDoctorId(UUID doctorId) {
        return appointmentRepository.findByDoctorId(doctorId)
                .stream()
                .map(mapper::toAppointmentDTO)
                .collect(Collectors.toList());
    }

    @Override
    public List<AppointmentDTO> getAppointmentsByPatientId(UUID patientId) {
        return appointmentRepository.findByPatientId(patientId)
                .stream()
                .map(mapper::toAppointmentDTO)
                .collect(Collectors.toList());
    }

    @Override
    public List<AppointmentDTO> getAppointmentsByStatus(AppointmentStatus status) {
        return appointmentRepository.findByStatus(status)
                .stream()
                .map(mapper::toAppointmentDTO)
                .collect(Collectors.toList());
    }

    @Override
    public List<AppointmentDTO> getAppointmentsBetween(ZonedDateTime start, ZonedDateTime end) {
        return appointmentRepository.findByAppointmentStartTimeBetween(start, end)
                .stream()
                .map(mapper::toAppointmentDTO)
                .collect(Collectors.toList());
    }

    @Override
    public List<AppointmentDTO> getAppointmentsByMedicalService(UUID medicalServiceId) {
        return appointmentRepository.findByMedicalServiceId(medicalServiceId)
                .stream()
                .map(mapper::toAppointmentDTO)
                .collect(Collectors.toList());
    }

    @Override
    public long countAppointmentsByDoctorId(UUID doctorId) {
        return appointmentRepository.countByDoctorId(doctorId);
    }

    @Override
    public long countAppointmentsByPatientId(UUID patientId) {
        return appointmentRepository.countByPatientId(patientId);
    }

    @Override
    public long countAppointmentsByMedicalService(UUID medicalServiceId) {
        return appointmentRepository.countByMedicalServiceId(medicalServiceId);
    }

    // ==============================
    // 🔹 CREATE
    // ==============================
    @Override
    public AppointmentDTO createAppointment(AppointmentRequestDTO requestDTO) {
        if (requestDTO.getMedicalServiceIds() == null || requestDTO.getMedicalServiceIds().isEmpty()) {
            throw new RuntimeException("At least one medical service must be provided");
        }

        List<MedicalService> medicalServices = medicalServiceRepository
                .findAllById(requestDTO.getMedicalServiceIds());

        if (medicalServices.size() != requestDTO.getMedicalServiceIds().size()) {
            throw new RuntimeException("Some medical services not found");
        }

        Appointment appointment = mapper.toAppointmentEntity(requestDTO, medicalServices);
        appointment.setCreatedAt(ZonedDateTime.now());
        appointment.setUpdatedAt(ZonedDateTime.now());

        appointmentRepository.save(appointment);
        return mapper.toAppointmentDTO(appointment);
    }

    // ==============================
    // 🔹 UPDATE
    // ==============================
    @Override
    public AppointmentDTO updateAppointment(UUID id, AppointmentRequestDTO requestDTO) {
        Appointment existing = appointmentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Appointment not found"));

        List<MedicalService> medicalServices = List.of();
        if (requestDTO.getMedicalServiceIds() != null && !requestDTO.getMedicalServiceIds().isEmpty()) {
            medicalServices = medicalServiceRepository.findAllById(requestDTO.getMedicalServiceIds());
            if (medicalServices.size() != requestDTO.getMedicalServiceIds().size()) {
                throw new RuntimeException("Some medical services not found");
            }
        }

        mapper.updateAppointmentEntity(existing, requestDTO, medicalServices);
        existing.setUpdatedAt(ZonedDateTime.now());

        appointmentRepository.save(existing);
        return mapper.toAppointmentDTO(existing);
    }

    // ==============================
    // 🔹 UPDATE STATUS
    // ==============================
    @Override
    public AppointmentDTO updateAppointmentStatus(UUID id, AppointmentStatus status) {
        Appointment appointment = appointmentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Appointment not found"));
        appointment.setStatus(status);
        appointment.setUpdatedAt(ZonedDateTime.now());
        appointmentRepository.save(appointment);
        return mapper.toAppointmentDTO(appointment);
    }

    // ==============================
    // 🔹 DELETE
    // ==============================
    @Override
    public void deleteAppointment(UUID id) {
        appointmentRepository.deleteById(id);
    }

    @Override
    public void deleteAppointmentsByDoctorId(UUID doctorId) {
        appointmentRepository.deleteByDoctorId(doctorId);
    }

    @Override
    public void deleteAppointmentsByPatientId(UUID patientId) {
        appointmentRepository.deleteByPatientId(patientId);
    }
}
