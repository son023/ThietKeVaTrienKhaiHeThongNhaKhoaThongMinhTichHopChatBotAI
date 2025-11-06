package com.main_project.appointment_service.service;

import com.main_project.appointment_service.dto.DoctorWorkScheduleDTO;
import com.main_project.appointment_service.dto.DoctorWorkScheduleRequestDTO;
import com.main_project.appointment_service.entity.DoctorWorkSchedule;
import com.main_project.appointment_service.entity.WorkSchedule;
import com.main_project.appointment_service.repository.DoctorWorkScheduleRepository;
import com.main_project.appointment_service.repository.WorkScheduleRepository;
import com.main_project.appointment_service.util.EntityDTOMapper;
import org.springframework.transaction.annotation.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.ZonedDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class DoctorWorkScheduleService implements IDoctorWorkSchedule {

    private final DoctorWorkScheduleRepository doctorWorkScheduleRepository;
    private final WorkScheduleRepository workScheduleRepository;
    private final EntityDTOMapper mapper;

    @Override
    public List<DoctorWorkScheduleDTO> getAllDoctorWorkSchedules() {
        return doctorWorkScheduleRepository.findAll()
                .stream()
                .map(mapper::toDoctorWorkScheduleDTO)
                .collect(Collectors.toList());
    }

    @Override
    public Optional<DoctorWorkScheduleDTO> getDoctorWorkScheduleById(UUID id) {
        return doctorWorkScheduleRepository.findById(id)
                .map(mapper::toDoctorWorkScheduleDTO);
    }

    @Override
    public List<DoctorWorkScheduleDTO> getDoctorWorkSchedulesByDoctorId(UUID doctorId) {
        return doctorWorkScheduleRepository.findByDoctorId(doctorId)
                .stream()
                .map(mapper::toDoctorWorkScheduleDTO)
                .collect(Collectors.toList());
    }

    @Override
    public List<DoctorWorkScheduleDTO> getDoctorWorkSchedulesByDate(ZonedDateTime date) {
        return doctorWorkScheduleRepository.findByWorkSchedule_Date(date)
                .stream()
                .map(mapper::toDoctorWorkScheduleDTO)
                .collect(Collectors.toList());
    }

    @Override
    public List<DoctorWorkScheduleDTO> getDoctorWorkSchedulesBetween(ZonedDateTime start, ZonedDateTime end) {
        return doctorWorkScheduleRepository.findByWorkSchedule_DateBetween(start, end)
                .stream()
                .map(mapper::toDoctorWorkScheduleDTO)
                .collect(Collectors.toList());
    }

    @Override
    public List<DoctorWorkScheduleDTO> getDoctorWorkSchedulesByWorkScheduleId(UUID workScheduleId) {
        return doctorWorkScheduleRepository.findByWorkSchedule_Id(workScheduleId)
                .stream()
                .map(mapper::toDoctorWorkScheduleDTO)
                .collect(Collectors.toList());
    }

    @Override
    public long countDoctorWorkSchedulesByDoctorId(UUID doctorId) {
        return doctorWorkScheduleRepository.countByDoctorId(doctorId);
    }

    @Override
    public DoctorWorkScheduleDTO createDoctorWorkSchedule(DoctorWorkScheduleRequestDTO requestDTO) {
        WorkSchedule workSchedule = workScheduleRepository.findById(requestDTO.getWorkScheduleId())
                .orElseThrow(() -> new IllegalArgumentException("WorkSchedule not found with id: " + requestDTO.getWorkScheduleId()));

        DoctorWorkSchedule entity = mapper.toDoctorWorkScheduleEntity(requestDTO, workSchedule);
        entity.setCreatedAt(ZonedDateTime.now());
        entity.setUpdatedAt(ZonedDateTime.now());

        DoctorWorkSchedule saved = doctorWorkScheduleRepository.save(entity);
        return mapper.toDoctorWorkScheduleDTO(saved);
    }

    @Override
    public DoctorWorkScheduleDTO updateDoctorWorkSchedule(UUID id, DoctorWorkScheduleRequestDTO requestDTO) {
        DoctorWorkSchedule existing = doctorWorkScheduleRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("DoctorWorkSchedule not found with id: " + id));

        WorkSchedule workSchedule = workScheduleRepository.findById(requestDTO.getWorkScheduleId())
                .orElseThrow(() -> new IllegalArgumentException("WorkSchedule not found with id: " + requestDTO.getWorkScheduleId()));

        mapper.updateDoctorWorkScheduleEntity(existing, requestDTO, workSchedule);
        existing.setUpdatedAt(ZonedDateTime.now());

        DoctorWorkSchedule updated = doctorWorkScheduleRepository.save(existing);
        return mapper.toDoctorWorkScheduleDTO(updated);
    }

    @Override
    public void deleteDoctorWorkSchedule(UUID id) {
        doctorWorkScheduleRepository.deleteById(id);
    }

    @Override
    public void deleteDoctorWorkSchedulesByDoctorId(UUID doctorId) {
        List<DoctorWorkSchedule> schedules = doctorWorkScheduleRepository.findByDoctorId(doctorId);
        doctorWorkScheduleRepository.deleteAll(schedules);
    }
}
