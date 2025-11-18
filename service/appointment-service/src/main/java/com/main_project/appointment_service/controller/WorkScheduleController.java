package com.main_project.appointment_service.controller;

import com.main_project.appointment_service.dto.WorkScheduleDTO;
import com.main_project.appointment_service.dto.WorkScheduleRequestDTO;
import com.main_project.appointment_service.service.IWorkSchedule;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.ZonedDateTime;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/appointment-service/work-schedules")
@RequiredArgsConstructor
public class WorkScheduleController {

    private final IWorkSchedule workScheduleService;

    @GetMapping
    public ResponseEntity<List<WorkScheduleDTO>> getAll() {
        return ResponseEntity.ok(workScheduleService.getAllWorkSchedules());
    }

    @GetMapping("/{id}")
    public ResponseEntity<WorkScheduleDTO> getById(@PathVariable UUID id) {
        return workScheduleService.getWorkScheduleById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/date")
    public ResponseEntity<List<WorkScheduleDTO>> getByDate(@RequestParam("date") ZonedDateTime date) {
        return ResponseEntity.ok(workScheduleService.getWorkSchedulesByDate(date));
    }

    @GetMapping("/between")
    public ResponseEntity<List<WorkScheduleDTO>> getBetween(
            @RequestParam("start") ZonedDateTime start,
            @RequestParam("end") ZonedDateTime end
    ) {
        return ResponseEntity.ok(workScheduleService.getWorkSchedulesBetween(start, end));
    }

    @PostMapping
    public ResponseEntity<WorkScheduleDTO> create(@RequestBody WorkScheduleRequestDTO requestDTO) {
        return ResponseEntity.ok(workScheduleService.createWorkSchedule(requestDTO));
    }

    @PutMapping("/{id}")
    public ResponseEntity<WorkScheduleDTO> update(
            @PathVariable UUID id,
            @RequestBody WorkScheduleRequestDTO requestDTO
    ) {
        return ResponseEntity.ok(workScheduleService.updateWorkSchedule(id, requestDTO));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<WorkScheduleDTO> updateStatus(
            @PathVariable UUID id,
            @RequestParam("status") String status
    ) {
        return ResponseEntity.ok(workScheduleService.updateWorkScheduleStatus(id, status));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        workScheduleService.deleteWorkSchedule(id);
        return ResponseEntity.noContent().build();
    }
}
