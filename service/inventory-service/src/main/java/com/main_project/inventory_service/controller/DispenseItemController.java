package com.main_project.inventory_service.controller;

import com.main_project.inventory_service.dto.DispenseItemRequest;
import com.main_project.inventory_service.dto.DispenseItemResponse;
import com.main_project.inventory_service.iservice.IDispenseItemService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/inventory-service/dispense-items")
@RequiredArgsConstructor
public class DispenseItemController {

    private final IDispenseItemService dispenseItemService;

    @PostMapping
    public ResponseEntity<DispenseItemResponse> create(@Valid @RequestBody DispenseItemRequest request) {
        DispenseItemResponse response = dispenseItemService.create(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PutMapping("/{id}")
    public ResponseEntity<DispenseItemResponse> update(@PathVariable UUID id, 
                                                        @Valid @RequestBody DispenseItemRequest request) {
        DispenseItemResponse response = dispenseItemService.update(id, request);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}")
    public ResponseEntity<DispenseItemResponse> getById(@PathVariable UUID id) {
        DispenseItemResponse response = dispenseItemService.getById(id);
        return ResponseEntity.ok(response);
    }

    @GetMapping
    public ResponseEntity<List<DispenseItemResponse>> getAll() {
        List<DispenseItemResponse> responses = dispenseItemService.getAll();
        return ResponseEntity.ok(responses);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        dispenseItemService.delete(id);
        return ResponseEntity.noContent().build();
    }
}



