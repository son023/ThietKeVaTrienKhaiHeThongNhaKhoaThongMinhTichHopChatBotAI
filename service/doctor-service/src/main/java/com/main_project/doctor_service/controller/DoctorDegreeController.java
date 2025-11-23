package com.main_project.doctor_service.controller;

import com.main_project.doctor_service.dto.DoctorDegreeRequestDTO;
import com.main_project.doctor_service.dto.DoctorDegreeResponseDTO;
import com.main_project.doctor_service.service.IDoctorDegreeService;
import jakarta.persistence.EntityNotFoundException;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/doctor-service/doctor-degrees")
@RequiredArgsConstructor
public class DoctorDegreeController {

    private final IDoctorDegreeService doctorDegreeService;

    @GetMapping
    public ResponseEntity<List<DoctorDegreeResponseDTO>> getAllDoctorDegrees() {
        return ResponseEntity.ok(doctorDegreeService.getAllDoctorDegrees());
    }

    @GetMapping("/{id}")
    public ResponseEntity<DoctorDegreeResponseDTO> getDoctorDegree(@PathVariable String id) {
        try {
            return ResponseEntity.ok(doctorDegreeService.getDoctorDegreeById(id));
        } catch (EntityNotFoundException ex) {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/doctor/{doctorId}")
    public ResponseEntity<List<DoctorDegreeResponseDTO>> getByDoctor(@PathVariable String doctorId) {
        return ResponseEntity.ok(doctorDegreeService.getDegreesByDoctorId(doctorId));
    }

    @PostMapping
    public ResponseEntity<DoctorDegreeResponseDTO> createDoctorDegree(@Valid @RequestBody DoctorDegreeRequestDTO request) {
        try {
            DoctorDegreeResponseDTO created = doctorDegreeService.createDoctorDegree(request);
            return ResponseEntity.status(HttpStatus.CREATED).body(created);
        } catch (EntityNotFoundException ex) {
            return ResponseEntity.notFound().build();
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<DoctorDegreeResponseDTO> updateDoctorDegree(
            @PathVariable String id,
            @Valid @RequestBody DoctorDegreeRequestDTO request) {
        try {
            DoctorDegreeResponseDTO updated = doctorDegreeService.updateDoctorDegree(id, request);
            return ResponseEntity.ok(updated);
        } catch (EntityNotFoundException ex) {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteDoctorDegree(@PathVariable String id) {
        try {
            doctorDegreeService.deleteDoctorDegree(id);
            return ResponseEntity.noContent().build();
        } catch (EntityNotFoundException ex) {
            return ResponseEntity.notFound().build();
        }
    }
}
