package com.main_project.labtest_service.controller;

import com.main_project.labtest_service.dto.LabTestDTO;
import com.main_project.labtest_service.dto.LabTestRequestDTO;
import com.main_project.labtest_service.service.LabTestService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/labtest-service/lab-tests")
@RequiredArgsConstructor
public class LabTestController {

    private final LabTestService labTestService;

    @PostMapping
    public ResponseEntity<LabTestDTO> createLabTest(@RequestBody LabTestRequestDTO dto) {
        return ResponseEntity.ok(labTestService.createLabTest(dto));
    }

    @PutMapping("/{id}")
    public ResponseEntity<LabTestDTO> updateLabTest(@PathVariable UUID id, @RequestBody LabTestRequestDTO dto) {
        return ResponseEntity.ok(labTestService.updateLabTest(id, dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteLabTest(@PathVariable UUID id) {
        labTestService.deleteLabTest(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{id}")
    public ResponseEntity<LabTestDTO> getLabTestById(@PathVariable UUID id) {
        return ResponseEntity.ok(labTestService.getLabTestById(id));
    }

    @GetMapping
    public ResponseEntity<List<LabTestDTO>> getAllLabTests() {
        return ResponseEntity.ok(labTestService.getAllLabTests());
    }

    @GetMapping("/doctor/{doctorId}")
    public ResponseEntity<List<LabTestDTO>> getByDoctorId(@PathVariable UUID doctorId) {
        return ResponseEntity.ok(labTestService.getLabTestsByDoctorId(doctorId));
    }

    @GetMapping("/technician/{technicianId}")
    public ResponseEntity<List<LabTestDTO>> getByTechnicianId(@PathVariable UUID technicianId) {
        return ResponseEntity.ok(labTestService.getLabTestsByLabTechnicianId(technicianId));
    }

    @GetMapping("/status/{status}")
    public ResponseEntity<List<LabTestDTO>> getByStatus(@PathVariable String status) {
        return ResponseEntity.ok(labTestService.getLabTestsByStatus(status));
    }
}
