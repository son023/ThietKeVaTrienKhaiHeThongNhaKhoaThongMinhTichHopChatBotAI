package com.main_project.patient_service.controller;

import com.main_project.patient_service.entity.Patient;
import com.main_project.patient_service.repository.PatientRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/patients")
@RequiredArgsConstructor
public class PatientController {

    private final PatientRepository patientRepository;

    @GetMapping
    public List<Patient> getAll() {
        return patientRepository.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Patient> getById(@PathVariable String id) {
        return patientRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public Patient create(@Validated @RequestBody Patient patient) {
        if (patient.getId() == null || patient.getId().isEmpty()) {
            patient.setId(UUID.randomUUID().toString());
        }
        LocalDateTime now = LocalDateTime.now();
        patient.setCreatedAt(now);
        patient.setUpdatedAt(now);
        return patientRepository.save(patient);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Patient> update(@PathVariable String id, @RequestBody Patient updated) {
        return patientRepository.findById(id)
                .map(existing -> {
                    updated.setId(existing.getId());
                    updated.setCreatedAt(existing.getCreatedAt());
                    updated.setUpdatedAt(LocalDateTime.now());
                    return ResponseEntity.ok(patientRepository.save(updated));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable String id) {
        if (!patientRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        patientRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}



