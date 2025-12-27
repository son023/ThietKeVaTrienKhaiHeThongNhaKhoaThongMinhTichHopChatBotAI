package com.main_project.inventory_service.controller;

import com.main_project.inventory_service.dto.MedicineRequest;
import com.main_project.inventory_service.dto.MedicineResponse;
import com.main_project.inventory_service.iservice.IMedicineService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/inventory-service/medicines")
@RequiredArgsConstructor
public class MedicineController {

    private final IMedicineService medicineService;

    //Dùng
    @PostMapping
    public ResponseEntity<MedicineResponse> create(@Valid @RequestBody MedicineRequest request) {
        MedicineResponse response = medicineService.create(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PutMapping("/{id}")
    public ResponseEntity<MedicineResponse> update(@PathVariable UUID id, 
                                                    @Valid @RequestBody MedicineRequest request) {
        MedicineResponse response = medicineService.update(id, request);
        return ResponseEntity.ok(response);
    }

    //Dùng
    @GetMapping("/{id}")
    public ResponseEntity<MedicineResponse> getById(@PathVariable UUID id) {
        MedicineResponse response = medicineService.getById(id);
        return ResponseEntity.ok(response);
    }

    //Dùng
    @GetMapping
    public ResponseEntity<List<MedicineResponse>> getAll() {
        List<MedicineResponse> responses = medicineService.getAll();
        return ResponseEntity.ok(responses);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        medicineService.delete(id);
        return ResponseEntity.noContent().build();
    }
}



