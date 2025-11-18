package com.main_project.labtest_service.controller;

import com.main_project.labtest_service.dto.MedicalAttachmentDTO;
import com.main_project.labtest_service.dto.MedicalAttachmentRequestDTO;
import com.main_project.labtest_service.service.MedicalAttachmentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/labtest-service/medical-attachments")
@RequiredArgsConstructor
public class MedicalAttachmentController {

    private final MedicalAttachmentService service;

    @PostMapping
    public ResponseEntity<MedicalAttachmentDTO> create(@RequestBody MedicalAttachmentRequestDTO dto) {
        return ResponseEntity.ok(service.create(dto));
    }

    @PutMapping("/{id}")
    public ResponseEntity<MedicalAttachmentDTO> update(@PathVariable UUID id, @RequestBody MedicalAttachmentRequestDTO dto) {
        return ResponseEntity.ok(service.update(id, dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{id}")
    public ResponseEntity<MedicalAttachmentDTO> getById(@PathVariable UUID id) {
        return ResponseEntity.ok(service.getById(id));
    }

    @GetMapping
    public ResponseEntity<List<MedicalAttachmentDTO>> getAll() {
        return ResponseEntity.ok(service.getAll());
    }

    @GetMapping("/labtest/{labTestId}")
    public ResponseEntity<List<MedicalAttachmentDTO>> getByLabTest(@PathVariable UUID labTestId) {
        return ResponseEntity.ok(service.getByLabTest(labTestId));
    }

    @GetMapping("/search")
    public ResponseEntity<List<MedicalAttachmentDTO>> searchByType(@RequestParam String type) {
        return ResponseEntity.ok(service.searchByType(type));
    }
}
