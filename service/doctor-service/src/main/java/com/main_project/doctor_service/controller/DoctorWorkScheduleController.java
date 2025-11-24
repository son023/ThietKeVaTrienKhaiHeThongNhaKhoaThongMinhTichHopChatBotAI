package com.main_project.doctor_service.controller;

import com.main_project.doctor_service.dto.DoctorWorkScheduleRequestDTO;
import com.main_project.doctor_service.dto.DoctorWorkScheduleResponseDTO;
import com.main_project.doctor_service.service.IDoctorWorkScheduleService;
import jakarta.persistence.EntityNotFoundException;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/doctor-service/doctor-work-schedules")
@RequiredArgsConstructor
public class DoctorWorkScheduleController {

    private final IDoctorWorkScheduleService doctorWorkScheduleService;

    @GetMapping
    public ResponseEntity<List<DoctorWorkScheduleResponseDTO>> getAllDoctorWorkSchedules() {
        return ResponseEntity.ok(doctorWorkScheduleService.getAllDoctorWorkSchedules());
    }

    @GetMapping("/{id}")
    public ResponseEntity<DoctorWorkScheduleResponseDTO> getDoctorWorkSchedule(@PathVariable String id) {
        try {
            return ResponseEntity.ok(doctorWorkScheduleService.getDoctorWorkScheduleById(id));
        } catch (EntityNotFoundException ex) {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/doctor/{doctorId}")
    public ResponseEntity<List<DoctorWorkScheduleResponseDTO>> getByDoctor(@PathVariable String doctorId) {
        return ResponseEntity.ok(doctorWorkScheduleService.getDoctorWorkSchedulesByDoctorId(doctorId));
    }

    @PostMapping
    public ResponseEntity<DoctorWorkScheduleResponseDTO> createDoctorWorkSchedule(
            @Valid @RequestBody DoctorWorkScheduleRequestDTO request) {
        try {
            DoctorWorkScheduleResponseDTO created = doctorWorkScheduleService.createDoctorWorkSchedule(request);
            return ResponseEntity.status(HttpStatus.CREATED).body(created);
        } catch (EntityNotFoundException ex) {
            return ResponseEntity.notFound().build();
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<DoctorWorkScheduleResponseDTO> updateDoctorWorkSchedule(
            @PathVariable String id,
            @Valid @RequestBody DoctorWorkScheduleRequestDTO request) {
        try {
            DoctorWorkScheduleResponseDTO updated = doctorWorkScheduleService.updateDoctorWorkSchedule(id, request);
            return ResponseEntity.ok(updated);
        } catch (EntityNotFoundException ex) {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteDoctorWorkSchedule(@PathVariable String id) {
        try {
            doctorWorkScheduleService.deleteDoctorWorkSchedule(id);
            return ResponseEntity.noContent().build();
        } catch (EntityNotFoundException ex) {
            return ResponseEntity.notFound().build();
        }
    }
}
