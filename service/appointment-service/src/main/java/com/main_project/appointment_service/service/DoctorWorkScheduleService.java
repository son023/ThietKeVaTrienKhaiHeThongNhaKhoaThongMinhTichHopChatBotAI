package com.main_project.appointment_service.service;

import com.main_project.appointment_service.dto.DoctorWorkScheduleDTO;
import com.main_project.appointment_service.dto.DoctorWorkScheduleRequestDTO;
import com.main_project.appointment_service.entity.DoctorWorkSchedule;
import com.main_project.appointment_service.entity.WorkSchedule;
import com.main_project.appointment_service.enums.DoctorWorkScheduleStatus;
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
        return doctorWorkScheduleRepository.findById(id).map(mapper::toDoctorWorkScheduleDTO);
    }

    @Override
    public List<DoctorWorkScheduleDTO> getDoctorWorkSchedulesByDoctorId(UUID doctorId) {
        return doctorWorkScheduleRepository.findByDoctorId(doctorId)
                .stream().map(mapper::toDoctorWorkScheduleDTO).collect(Collectors.toList());
    }

    @Override
    public List<DoctorWorkScheduleDTO> getDoctorWorkSchedulesByStatus(String status) {
        return doctorWorkScheduleRepository.findByStatus(status)
                .stream().map(mapper::toDoctorWorkScheduleDTO).collect(Collectors.toList());
    }

    @Override
    public List<DoctorWorkScheduleDTO> getDoctorWorkSchedulesByWorkScheduleId(UUID workScheduleId) {
        return doctorWorkScheduleRepository.findByWorkSchedule_Id(workScheduleId)
                .stream().map(mapper::toDoctorWorkScheduleDTO).collect(Collectors.toList());
    }

    @Override
    public List<DoctorWorkScheduleDTO> getDoctorWorkSchedulesByDate(ZonedDateTime date) {
        return doctorWorkScheduleRepository.findByWorkSchedule_WorkDate(date)
                .stream().map(mapper::toDoctorWorkScheduleDTO).collect(Collectors.toList());
    }

    @Override
    public List<DoctorWorkScheduleDTO> getDoctorWorkSchedulesBetween(ZonedDateTime start, ZonedDateTime end) {
        return doctorWorkScheduleRepository.findByWorkSchedule_WorkDateBetween(start, end)
                .stream().map(mapper::toDoctorWorkScheduleDTO).collect(Collectors.toList());
    }

    @Override
    public DoctorWorkScheduleDTO createDoctorWorkSchedule(DoctorWorkScheduleRequestDTO requestDTO) {
        WorkSchedule workSchedule = workScheduleRepository.findById(requestDTO.getWorkScheduleId())
                .orElseThrow(() -> new RuntimeException("WorkSchedule not found"));

        DoctorWorkSchedule newSchedule = mapper.toDoctorWorkScheduleEntity(requestDTO, workSchedule);
        DoctorWorkSchedule saved = doctorWorkScheduleRepository.save(newSchedule);
        return mapper.toDoctorWorkScheduleDTO(saved);
    }

    @Override
    public DoctorWorkScheduleDTO updateDoctorWorkSchedule(UUID id, DoctorWorkScheduleRequestDTO requestDTO) {
        DoctorWorkSchedule existing = doctorWorkScheduleRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("DoctorWorkSchedule not found"));

        WorkSchedule workSchedule = workScheduleRepository.findById(requestDTO.getWorkScheduleId())
                .orElseThrow(() -> new RuntimeException("WorkSchedule not found"));

        existing.setDoctorId(requestDTO.getDoctorId().toString());
        existing.setStatus(requestDTO.getStatus());
        existing.setUpdatedAt(ZonedDateTime.now());
        existing.setWorkSchedule(workSchedule);

        DoctorWorkSchedule updated = doctorWorkScheduleRepository.save(existing);
        return mapper.toDoctorWorkScheduleDTO(updated);
    }

    @Override
    public DoctorWorkScheduleDTO updateDoctorWorkScheduleStatus(UUID id, DoctorWorkScheduleStatus status) {
        DoctorWorkSchedule existing = doctorWorkScheduleRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("DoctorWorkSchedule not found"));
        existing.setStatus(status);
        existing.setUpdatedAt(ZonedDateTime.now());
        DoctorWorkSchedule updated = doctorWorkScheduleRepository.save(existing);
        return mapper.toDoctorWorkScheduleDTO(updated);
    }

    @Override
    public void deleteDoctorWorkSchedule(UUID id) {
        if (!doctorWorkScheduleRepository.existsById(id)) {
            throw new RuntimeException("DoctorWorkSchedule not found");
        }
        doctorWorkScheduleRepository.deleteById(id);
    }

}
