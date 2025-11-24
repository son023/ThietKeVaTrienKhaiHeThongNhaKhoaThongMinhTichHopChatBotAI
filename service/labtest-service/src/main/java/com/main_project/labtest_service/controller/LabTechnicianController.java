package com.main_project.labtest_service.controller;

import com.main_project.labtest_service.dto.LabTechnicianDTO;
import com.main_project.labtest_service.dto.LabTechnicianRequestDTO;
import com.main_project.labtest_service.service.ILabTechnicianService;
import jakarta.persistence.EntityNotFoundException;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/labtest-service/lab-technicians")
@RequiredArgsConstructor
public class LabTechnicianController {

    private final ILabTechnicianService labTechnicianService;

    @GetMapping
    public ResponseEntity<List<LabTechnicianDTO>> getAll() {
        return ResponseEntity.ok(labTechnicianService.getAllLabTechnicians());
    }

    @GetMapping("/{userId}")
    public ResponseEntity<LabTechnicianDTO> getById(@PathVariable UUID userId) {
        try {
            return ResponseEntity.ok(labTechnicianService.getLabTechnicianById(userId));
        } catch (EntityNotFoundException ex) {
            return ResponseEntity.notFound().build();
        }
    }

    @PostMapping
    public ResponseEntity<LabTechnicianDTO> create(@Valid @RequestBody LabTechnicianRequestDTO request) {
        try {
            LabTechnicianDTO created = labTechnicianService.createLabTechnician(request);
            return ResponseEntity.status(HttpStatus.CREATED).body(created);
        } catch (DataIntegrityViolationException ex) {
            return ResponseEntity.status(HttpStatus.CONFLICT).build();
        }
    }

    @PutMapping("/{userId}")
    public ResponseEntity<LabTechnicianDTO> update(@PathVariable UUID userId,
                                                   @Valid @RequestBody LabTechnicianRequestDTO request) {
        try {
            LabTechnicianDTO updated = labTechnicianService.updateLabTechnician(userId, request);
            return ResponseEntity.ok(updated);
        } catch (EntityNotFoundException ex) {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{userId}")
    public ResponseEntity<Void> delete(@PathVariable UUID userId) {
        try {
            labTechnicianService.deleteLabTechnician(userId);
            return ResponseEntity.noContent().build();
        } catch (EntityNotFoundException ex) {
            return ResponseEntity.notFound().build();
        }
    }
}
