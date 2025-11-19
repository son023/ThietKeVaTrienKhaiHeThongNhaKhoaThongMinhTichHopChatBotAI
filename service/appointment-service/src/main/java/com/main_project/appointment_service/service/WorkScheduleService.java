package com.main_project.appointment_service.service;

import com.main_project.appointment_service.dto.WorkScheduleDTO;
import com.main_project.appointment_service.dto.WorkScheduleRequestDTO;
import com.main_project.appointment_service.entity.WorkSchedule;
import com.main_project.appointment_service.repository.WorkScheduleRepository;
import com.main_project.appointment_service.util.EntityDTOMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.ZonedDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class WorkScheduleService implements IWorkSchedule {

    private final WorkScheduleRepository workScheduleRepository;
    private final EntityDTOMapper mapper;

    @Override
    public List<WorkScheduleDTO> getAllWorkSchedules() {
        return workScheduleRepository.findAll()
                .stream().map(mapper::toWorkScheduleDTO).collect(Collectors.toList());
    }

    @Override
    public Optional<WorkScheduleDTO> getWorkScheduleById(UUID id) {
        return workScheduleRepository.findById(id).map(mapper::toWorkScheduleDTO);
    }

    @Override
    public List<WorkScheduleDTO> getWorkSchedulesByDate(ZonedDateTime date) {
        return workScheduleRepository.findByWorkDate(date)
                .stream().map(mapper::toWorkScheduleDTO).collect(Collectors.toList());
    }

    @Override
    public List<WorkScheduleDTO> getWorkSchedulesBetween(ZonedDateTime start, ZonedDateTime end) {
        return workScheduleRepository.findByWorkDateBetween(start, end)
                .stream().map(mapper::toWorkScheduleDTO).collect(Collectors.toList());
    }

    @Override
    public WorkScheduleDTO createWorkSchedule(WorkScheduleRequestDTO requestDTO) {
        WorkSchedule entity = mapper.toWorkScheduleEntity(requestDTO);
        WorkSchedule saved = workScheduleRepository.save(entity);
        return mapper.toWorkScheduleDTO(saved);
    }

    @Override
    public WorkScheduleDTO updateWorkSchedule(UUID id, WorkScheduleRequestDTO requestDTO) {
        WorkSchedule existing = workScheduleRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("WorkSchedule not found"));

        existing.setWorkDate(requestDTO.getWorkDate());
        existing.setStartTime(requestDTO.getStartTime());
        existing.setEndTime(requestDTO.getEndTime());

        WorkSchedule updated = workScheduleRepository.save(existing);
        return mapper.toWorkScheduleDTO(updated);
    }

    @Override
    public WorkScheduleDTO updateWorkScheduleStatus(UUID id, String status) {
        WorkSchedule existing = workScheduleRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("WorkSchedule not found"));

        WorkSchedule updated = workScheduleRepository.save(existing);
        return mapper.toWorkScheduleDTO(updated);
    }

    @Override
    public void deleteWorkSchedule(UUID id) {
        if (!workScheduleRepository.existsById(id)) {
            throw new RuntimeException("WorkSchedule not found");
        }
        workScheduleRepository.deleteById(id);
    }
}
