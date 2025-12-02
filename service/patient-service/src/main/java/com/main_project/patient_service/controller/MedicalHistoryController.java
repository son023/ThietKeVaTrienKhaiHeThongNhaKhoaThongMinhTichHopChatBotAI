package com.main_project.patient_service.controller;

import com.main_project.patient_service.dto.MedicalHistoryRequestDTO;
import com.main_project.patient_service.dto.MedicalHistoryResponseDTO;
import com.main_project.patient_service.service.MedicalHistoryService;
import jakarta.persistence.EntityNotFoundException;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/patient-service/medical-histories")
@RequiredArgsConstructor
public class MedicalHistoryController {

    private final MedicalHistoryService medicalHistoryService;

    @GetMapping
    public ResponseEntity<List<MedicalHistoryResponseDTO>> getAllMedicalHistories() {
        return ResponseEntity.ok(medicalHistoryService.getAllMedicalHistories());
    }

    @GetMapping("/{id}")
    public ResponseEntity<MedicalHistoryResponseDTO> getMedicalHistory(@PathVariable UUID id) {
        try {
            return ResponseEntity.ok(medicalHistoryService.getMedicalHistoryById(id));
        } catch (EntityNotFoundException ex) {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/patient/{patientId}")
    public ResponseEntity<List<MedicalHistoryResponseDTO>> getByPatient(@PathVariable UUID patientId) {
        return ResponseEntity.ok(medicalHistoryService.getMedicalHistoriesByPatient(patientId));
    }

    @GetMapping("/appointment/{appointmentId}")
    public ResponseEntity<List<MedicalHistoryResponseDTO>> getByAppointment(@PathVariable UUID appointmentId) {
        return ResponseEntity.ok(medicalHistoryService.getMedicalHistoriesByAppointment(appointmentId));
    }

    @GetMapping("/disease")
    public ResponseEntity<List<MedicalHistoryResponseDTO>> searchByDisease(@RequestParam("q") String diseaseKeyword) {
        return ResponseEntity.ok(medicalHistoryService.searchMedicalHistoriesByDisease(diseaseKeyword));
    }

    @PostMapping
    public ResponseEntity<MedicalHistoryResponseDTO> createMedicalHistory(
            @Valid @RequestBody MedicalHistoryRequestDTO request) {
        try {
            MedicalHistoryResponseDTO created = medicalHistoryService.createMedicalHistory(request);
            return ResponseEntity.status(HttpStatus.CREATED).body(created);
        } catch (EntityNotFoundException ex) {
            return ResponseEntity.notFound().build();
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<MedicalHistoryResponseDTO> updateMedicalHistory(
            @PathVariable UUID id,
            @Valid @RequestBody MedicalHistoryRequestDTO request) {
        try {
            MedicalHistoryResponseDTO updated = medicalHistoryService.updateMedicalHistory(id, request);
            return ResponseEntity.ok(updated);
        } catch (EntityNotFoundException ex) {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteMedicalHistory(@PathVariable UUID id) {
        try {
            medicalHistoryService.deleteMedicalHistory(id);
            return ResponseEntity.noContent().build();
        } catch (EntityNotFoundException ex) {
            return ResponseEntity.notFound().build();
        }
    }
}
