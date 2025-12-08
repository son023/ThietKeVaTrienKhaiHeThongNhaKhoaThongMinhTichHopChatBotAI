package com.main_project.inventory_service.controller;

import com.main_project.inventory_service.dto.DispenseOrderRequest;
import com.main_project.inventory_service.dto.DispenseOrderResponse;
import com.main_project.inventory_service.iservice.IDispenseOrderService;
import io.swagger.v3.oas.annotations.Parameter;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/inventory-service/dispense-orders")
@RequiredArgsConstructor
public class DispenseOrderController {

    private final IDispenseOrderService dispenseOrderService;

    @PostMapping
    public ResponseEntity<DispenseOrderResponse> create(@Valid @RequestBody DispenseOrderRequest request) {
        DispenseOrderResponse response = dispenseOrderService.create(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PutMapping("/{id}")
    public ResponseEntity<DispenseOrderResponse> update(@PathVariable UUID id, 
                                                         @Valid @RequestBody DispenseOrderRequest request) {
        DispenseOrderResponse response = dispenseOrderService.update(id, request);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}")
    public ResponseEntity<DispenseOrderResponse> getById(@PathVariable UUID id) {
        DispenseOrderResponse response = dispenseOrderService.getById(id);
        return ResponseEntity.ok(response);
    }

    @GetMapping
    public ResponseEntity<List<DispenseOrderResponse>> getAll() {
        List<DispenseOrderResponse> responses = dispenseOrderService.getAll();
        return ResponseEntity.ok(responses);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        dispenseOrderService.delete(id);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{id}/sold")
    public ResponseEntity<DispenseOrderResponse> markAsSold(
            @Parameter(description = "ID của đơn thuốc", required = true)
            @PathVariable UUID id) {
        DispenseOrderResponse soldDispenseOrder = dispenseOrderService.markAsSold(id);
        return ResponseEntity.ok(soldDispenseOrder);
    }

    @GetMapping("/prescription/{id}")
    public ResponseEntity<DispenseOrderResponse> getByPrescriptionId(@PathVariable UUID id) {
        DispenseOrderResponse response = dispenseOrderService.getByPrescriptionId(id);
        return ResponseEntity.ok(response);
    }

}



