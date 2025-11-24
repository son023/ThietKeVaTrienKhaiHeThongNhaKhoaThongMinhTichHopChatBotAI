package com.main_project.patient_service.controller;

import com.main_project.patient_service.dto.PatientRequestDTO;
import com.main_project.patient_service.dto.PatientResponseDTO;
import com.main_project.patient_service.service.IPatientService;
import jakarta.persistence.EntityNotFoundException;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/patient-service/patients")
@RequiredArgsConstructor
public class PatientController {

    private final IPatientService patientService;

    @GetMapping
    public ResponseEntity<List<PatientResponseDTO>> getAllPatients() {
        return ResponseEntity.ok(patientService.getAllPatients());
    }

    @GetMapping("/{userId}")
    public ResponseEntity<PatientResponseDTO> getPatient(@PathVariable String userId) {
        try {
            return ResponseEntity.ok(patientService.getPatientById(userId));
        } catch (EntityNotFoundException ex) {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/gender/{gender}")
    public ResponseEntity<List<PatientResponseDTO>> getPatientsByGender(@PathVariable String gender) {
        return ResponseEntity.ok(patientService.getPatientsByGender(gender));
    }

    @GetMapping("/blood-type/{bloodType}")
    public ResponseEntity<List<PatientResponseDTO>> getPatientsByBloodType(@PathVariable String bloodType) {
        return ResponseEntity.ok(patientService.getPatientsByBloodType(bloodType));
    }

    @PostMapping
    public ResponseEntity<PatientResponseDTO> createPatient(@Valid @RequestBody PatientRequestDTO request) {
        try {
            PatientResponseDTO created = patientService.createPatient(request);
            return ResponseEntity.status(HttpStatus.CREATED).body(created);
        } catch (DataIntegrityViolationException ex) {
            return ResponseEntity.status(HttpStatus.CONFLICT).build();
        }
    }

    @PutMapping("/{userId}")
    public ResponseEntity<PatientResponseDTO> updatePatient(
            @PathVariable String userId,
            @Valid @RequestBody PatientRequestDTO request) {
        try {
            PatientResponseDTO updated = patientService.updatePatient(userId, request);
            return ResponseEntity.ok(updated);
        } catch (EntityNotFoundException ex) {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{userId}")
    public ResponseEntity<Void> deletePatient(@PathVariable String userId) {
        try {
            patientService.deletePatient(userId);
            return ResponseEntity.noContent().build();
        } catch (EntityNotFoundException ex) {
            return ResponseEntity.notFound().build();
        }
    }
}
