package com.main_project.appointment_service.controller;

import com.main_project.appointment_service.dto.DoctorWorkScheduleDTO;
import com.main_project.appointment_service.dto.DoctorWorkScheduleRequestDTO;
import com.main_project.appointment_service.service.IDoctorWorkSchedule;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.ZonedDateTime;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/appointment-service/doctor-work-schedules")
@RequiredArgsConstructor
public class DoctorWorkScheduleController {

    private final IDoctorWorkSchedule doctorWorkScheduleService;

    @GetMapping
    public ResponseEntity<List<DoctorWorkScheduleDTO>> getAll() {
        return ResponseEntity.ok(doctorWorkScheduleService.getAllDoctorWorkSchedules());
    }

    @GetMapping("/{id}")
    public ResponseEntity<DoctorWorkScheduleDTO> getById(@PathVariable UUID id) {
        return doctorWorkScheduleService.getDoctorWorkScheduleById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/doctor/{doctorId}")
    public ResponseEntity<List<DoctorWorkScheduleDTO>> getByDoctorId(@PathVariable UUID doctorId) {
        return ResponseEntity.ok(doctorWorkScheduleService.getDoctorWorkSchedulesByDoctorId(doctorId));
    }

    @GetMapping("/status/{status}")
    public ResponseEntity<List<DoctorWorkScheduleDTO>> getByStatus(@PathVariable String status) {
        return ResponseEntity.ok(doctorWorkScheduleService.getDoctorWorkSchedulesByStatus(status));
    }

    @GetMapping("/work-schedule/{workScheduleId}")
    public ResponseEntity<List<DoctorWorkScheduleDTO>> getByWorkScheduleId(@PathVariable UUID workScheduleId) {
        return ResponseEntity.ok(doctorWorkScheduleService.getDoctorWorkSchedulesByWorkScheduleId(workScheduleId));
    }

    @GetMapping("/date")
    public ResponseEntity<List<DoctorWorkScheduleDTO>> getByDate(@RequestParam("date") ZonedDateTime date) {
        return ResponseEntity.ok(doctorWorkScheduleService.getDoctorWorkSchedulesByDate(date));
    }

    @GetMapping("/between")
    public ResponseEntity<List<DoctorWorkScheduleDTO>> getBetween(
            @RequestParam("start") ZonedDateTime start,
            @RequestParam("end") ZonedDateTime end
    ) {
        return ResponseEntity.ok(doctorWorkScheduleService.getDoctorWorkSchedulesBetween(start, end));
    }

    @PostMapping
    public ResponseEntity<DoctorWorkScheduleDTO> create(@RequestBody DoctorWorkScheduleRequestDTO requestDTO) {
        return ResponseEntity.ok(doctorWorkScheduleService.createDoctorWorkSchedule(requestDTO));
    }

    @PutMapping("/{id}")
    public ResponseEntity<DoctorWorkScheduleDTO> update(
            @PathVariable UUID id,
            @RequestBody DoctorWorkScheduleRequestDTO requestDTO
    ) {
        return ResponseEntity.ok(doctorWorkScheduleService.updateDoctorWorkSchedule(id, requestDTO));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<DoctorWorkScheduleDTO> updateStatus(
            @PathVariable UUID id,
            @RequestParam("status") String status
    ) {
        return ResponseEntity.ok(doctorWorkScheduleService.updateDoctorWorkScheduleStatus(id, status));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        doctorWorkScheduleService.deleteDoctorWorkSchedule(id);
        return ResponseEntity.noContent().build();
    }
}
