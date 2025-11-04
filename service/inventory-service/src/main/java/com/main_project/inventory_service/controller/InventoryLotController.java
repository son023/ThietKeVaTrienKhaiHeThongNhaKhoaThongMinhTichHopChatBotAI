package com.main_project.inventory_service.controller;

import com.main_project.inventory_service.dto.InventoryLotRequest;
import com.main_project.inventory_service.dto.InventoryLotResponse;
import com.main_project.inventory_service.iservice.IInventoryLotService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/inventory-lots")
@RequiredArgsConstructor
public class InventoryLotController {

    private final IInventoryLotService inventoryLotService;

    @PostMapping
    public ResponseEntity<InventoryLotResponse> create(@Valid @RequestBody InventoryLotRequest request) {
        InventoryLotResponse response = inventoryLotService.create(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PutMapping("/{id}")
    public ResponseEntity<InventoryLotResponse> update(@PathVariable UUID id, 
                                                        @Valid @RequestBody InventoryLotRequest request) {
        InventoryLotResponse response = inventoryLotService.update(id, request);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}")
    public ResponseEntity<InventoryLotResponse> getById(@PathVariable UUID id) {
        InventoryLotResponse response = inventoryLotService.getById(id);
        return ResponseEntity.ok(response);
    }

    @GetMapping
    public ResponseEntity<List<InventoryLotResponse>> getAll() {
        List<InventoryLotResponse> responses = inventoryLotService.getAll();
        return ResponseEntity.ok(responses);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        inventoryLotService.delete(id);
        return ResponseEntity.noContent().build();
    }
}



