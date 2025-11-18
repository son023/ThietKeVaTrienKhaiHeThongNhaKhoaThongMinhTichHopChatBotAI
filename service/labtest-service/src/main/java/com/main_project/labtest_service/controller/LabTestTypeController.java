package com.main_project.labtest_service.controller;

import com.main_project.labtest_service.dto.LabTestTypeDTO;
import com.main_project.labtest_service.dto.LabTestTypeRequestDTO;
import com.main_project.labtest_service.service.LabTestTypeService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/labtest-service/lab-test-types")
@RequiredArgsConstructor
public class LabTestTypeController {

    private final LabTestTypeService labTestTypeService;

    @PostMapping
    public ResponseEntity<LabTestTypeDTO> create(@RequestBody LabTestTypeRequestDTO dto) {
        return ResponseEntity.ok(labTestTypeService.create(dto));
    }

    @PutMapping("/{id}")
    public ResponseEntity<LabTestTypeDTO> update(@PathVariable UUID id, @RequestBody LabTestTypeRequestDTO dto) {
        return ResponseEntity.ok(labTestTypeService.update(id, dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        labTestTypeService.delete(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{id}")
    public ResponseEntity<LabTestTypeDTO> getById(@PathVariable UUID id) {
        return ResponseEntity.ok(labTestTypeService.getById(id));
    }

    @GetMapping
    public ResponseEntity<List<LabTestTypeDTO>> getAll() {
        return ResponseEntity.ok(labTestTypeService.getAll());
    }

    @GetMapping("/search")
    public ResponseEntity<List<LabTestTypeDTO>> searchByName(@RequestParam String name) {
        return ResponseEntity.ok(labTestTypeService.searchByName(name));
    }
}
