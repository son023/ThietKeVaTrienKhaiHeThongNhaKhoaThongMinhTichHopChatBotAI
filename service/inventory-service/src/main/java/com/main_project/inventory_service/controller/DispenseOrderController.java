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

import java.util.Arrays;
import java.util.List;
import java.util.Map;
import java.util.Optional;
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

    //Dùng
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

    //Dùng
    @PatchMapping("/{id}/sold")
    public ResponseEntity<DispenseOrderResponse> markAsSold(
            @Parameter(description = "ID của đơn thuốc", required = true)
            @PathVariable UUID id,
            @RequestParam UUID pharmacistId) {
        DispenseOrderResponse soldDispenseOrder = dispenseOrderService.markAsSold(id, pharmacistId);
        return ResponseEntity.ok(soldDispenseOrder);
    }

    @GetMapping("/prescription/{id}")
    public ResponseEntity<DispenseOrderResponse> getByPrescriptionId(@PathVariable UUID id) {
        DispenseOrderResponse response = dispenseOrderService.getByPrescriptionId(id);
        return ResponseEntity.ok(response);
    }

    //Dùng
    @GetMapping("/by-status")
    public ResponseEntity<List<DispenseOrderResponse>> getByStatus(
            @RequestParam(required = false) String status) {
        if (status != null) {
            List<DispenseOrderResponse> responses = dispenseOrderService.getAllByStatus(status);
            return ResponseEntity.ok(responses);
        } else {
            // Nếu không truyền status, lấy tất cả trừ SOLD và CANCELLED
            List<String> pendingStatuses = Arrays.asList("PENDING", "RESERVED", "IN_PROGRESS", "RELEASED");
            List<DispenseOrderResponse> responses = dispenseOrderService.getAllByStatuses(pendingStatuses);
            return ResponseEntity.ok(responses);
        }
    }

    //Dùng
    @GetMapping("/{id}/payment-status")
    public ResponseEntity<Map<String, Object>> getPaymentStatusOfPrescription(@PathVariable UUID id) {
        Map<String, Object> status = dispenseOrderService.getPaymentStatusOfPrescription(id);
        return ResponseEntity.ok(status);
    }

    @GetMapping("/medical-history/{id}")
    public ResponseEntity<DispenseOrderResponse> getByMedicalHistoryId(@PathVariable UUID id) {
        Optional<DispenseOrderResponse> responseOpt = dispenseOrderService.getByMedicalHistoryId(id);
        
        if (responseOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        
        return ResponseEntity.ok(responseOpt.get());
    }

    @GetMapping("/medical-history/{medicalHistoryId}/prescription-status")
    public ResponseEntity<Map<String, Object>> getPrescriptionStatusByMedicalHistory(
            @PathVariable UUID medicalHistoryId) {
        Map<String, Object> status = dispenseOrderService.getPrescriptionStatusByMedicalHistoryId(medicalHistoryId);
        return ResponseEntity.ok(status);
    }

}



