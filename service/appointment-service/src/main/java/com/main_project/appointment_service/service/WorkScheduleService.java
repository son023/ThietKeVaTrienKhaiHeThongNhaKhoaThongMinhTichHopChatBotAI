package com.main_project.appointment_service.service;

import com.main_project.appointment_service.dto.WorkScheduleDTO;
import com.main_project.appointment_service.dto.WorkScheduleRequestDTO;
import com.main_project.appointment_service.entity.WorkSchedule;
import com.main_project.appointment_service.repository.WorkScheduleRepository;
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

    // 🟢 Mapper: Entity → DTO
    private WorkScheduleDTO toDTO(WorkSchedule entity) {
        if (entity == null) return null;
        return WorkScheduleDTO.builder()
                .id(entity.getId())
                .workDate(entity.getWorkDate())
                .startTime(entity.getStartTime())
                .endTime(entity.getEndTime())
                .build();
    }

    // 🟢 Mapper: Request → Entity
    private WorkSchedule toEntity(WorkScheduleRequestDTO dto) {
        if (dto == null) return null;
        return WorkSchedule.builder()
                .workDate(dto.getWorkDate())
                .startTime(dto.getStartTime())
                .endTime(dto.getEndTime())
                .build();
    }

    @Override
    public List<WorkScheduleDTO> getAllWorkSchedules() {
        return workScheduleRepository.findAll()
                .stream().map(this::toDTO).collect(Collectors.toList());
    }

    @Override
    public Optional<WorkScheduleDTO> getWorkScheduleById(UUID id) {
        return workScheduleRepository.findById(id).map(this::toDTO);
    }

    @Override
    public List<WorkScheduleDTO> getWorkSchedulesByDate(ZonedDateTime date) {
        return workScheduleRepository.findByWorkDate(date)
                .stream().map(this::toDTO).collect(Collectors.toList());
    }

    @Override
    public List<WorkScheduleDTO> getWorkSchedulesBetween(ZonedDateTime start, ZonedDateTime end) {
        return workScheduleRepository.findByWorkDateBetween(start, end)
                .stream().map(this::toDTO).collect(Collectors.toList());
    }

    @Override
    public WorkScheduleDTO createWorkSchedule(WorkScheduleRequestDTO requestDTO) {
        WorkSchedule entity = toEntity(requestDTO);
        WorkSchedule saved = workScheduleRepository.save(entity);
        return toDTO(saved);
    }

    @Override
    public WorkScheduleDTO updateWorkSchedule(UUID id, WorkScheduleRequestDTO requestDTO) {
        WorkSchedule existing = workScheduleRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("WorkSchedule not found"));

        existing.setWorkDate(requestDTO.getWorkDate());
        existing.setStartTime(requestDTO.getStartTime());
        existing.setEndTime(requestDTO.getEndTime());

        WorkSchedule updated = workScheduleRepository.save(existing);
        return toDTO(updated);
    }

    @Override
    public WorkScheduleDTO updateWorkScheduleStatus(UUID id, String status) {
        WorkSchedule existing = workScheduleRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("WorkSchedule not found"));

        WorkSchedule updated = workScheduleRepository.save(existing);
        return toDTO(updated);
    }

    @Override
    public void deleteWorkSchedule(UUID id) {
        if (!workScheduleRepository.existsById(id)) {
            throw new RuntimeException("WorkSchedule not found");
        }
        workScheduleRepository.deleteById(id);
    }
}
