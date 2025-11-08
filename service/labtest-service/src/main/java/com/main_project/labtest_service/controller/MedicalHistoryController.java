package com.main_project.labtest_service.controller;

import com.main_project.labtest_service.dto.MedicalHistoryDTO;
import com.main_project.labtest_service.dto.MedicalHistoryRequestDTO;
import com.main_project.labtest_service.service.MedicalHistoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/medical-history")
@RequiredArgsConstructor
public class MedicalHistoryController {
    private final MedicalHistoryService service;

    @GetMapping
    public ResponseEntity<List<MedicalHistoryDTO>> getAll() {
        return ResponseEntity.ok(service.getAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<MedicalHistoryDTO> getById(@PathVariable UUID id) {
        return ResponseEntity.ok(service.getById(id));
    }

    @PostMapping
    public ResponseEntity<MedicalHistoryDTO> create(@RequestBody MedicalHistoryRequestDTO dto) {
        return ResponseEntity.ok(service.create(dto));
    }

    @PutMapping("/{id}")
    public ResponseEntity<MedicalHistoryDTO> update(@PathVariable UUID id, @RequestBody MedicalHistoryRequestDTO dto) {
        return ResponseEntity.ok(service.update(id, dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/appointment/{appointmentId}")
    public ResponseEntity<List<MedicalHistoryDTO>> findByAppointment(@PathVariable UUID appointmentId) {
        return ResponseEntity.ok(service.findByAppointmentId(appointmentId));
    }
}
