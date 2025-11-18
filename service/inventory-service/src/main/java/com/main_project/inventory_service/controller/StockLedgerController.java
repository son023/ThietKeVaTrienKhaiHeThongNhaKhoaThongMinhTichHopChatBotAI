package com.main_project.inventory_service.controller;

import com.main_project.inventory_service.dto.StockLedgerRequest;
import com.main_project.inventory_service.dto.StockLedgerResponse;
import com.main_project.inventory_service.iservice.IStockLedgerService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/inventory-service/stock-ledgers")
@RequiredArgsConstructor
public class StockLedgerController {

    private final IStockLedgerService stockLedgerService;

    @PostMapping
    public ResponseEntity<StockLedgerResponse> create(@Valid @RequestBody StockLedgerRequest request) {
        StockLedgerResponse response = stockLedgerService.create(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PutMapping("/{id}")
    public ResponseEntity<StockLedgerResponse> update(@PathVariable UUID id, 
                                                       @Valid @RequestBody StockLedgerRequest request) {
        StockLedgerResponse response = stockLedgerService.update(id, request);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}")
    public ResponseEntity<StockLedgerResponse> getById(@PathVariable UUID id) {
        StockLedgerResponse response = stockLedgerService.getById(id);
        return ResponseEntity.ok(response);
    }

    @GetMapping
    public ResponseEntity<List<StockLedgerResponse>> getAll() {
        List<StockLedgerResponse> responses = stockLedgerService.getAll();
        return ResponseEntity.ok(responses);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        stockLedgerService.delete(id);
        return ResponseEntity.noContent().build();
    }
}



