package com.main_project.inventory_service.service;

import com.main_project.inventory_service.dto.StockLedgerRequest;
import com.main_project.inventory_service.dto.StockLedgerResponse;
import com.main_project.inventory_service.entity.InventoryLot;
import com.main_project.inventory_service.entity.Pharmacist;
import com.main_project.inventory_service.entity.StockLedger;
import com.main_project.inventory_service.iservice.IStockLedgerService;
import com.main_project.inventory_service.repository.InventoryLotRepository;
import com.main_project.inventory_service.repository.StockLedgerRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class StockLedgerService implements IStockLedgerService {

    private final StockLedgerRepository stockLedgerRepository;
    private final InventoryLotRepository inventoryLotRepository;

    @Override
    @Transactional
    public StockLedgerResponse create(StockLedgerRequest request) {
        InventoryLot inventoryLot = inventoryLotRepository.findById(request.getInventoryLotId())
                .orElseThrow(() -> new RuntimeException("InventoryLot not found with id: " + request.getInventoryLotId()));

        StockLedger stockLedger = new StockLedger();
        stockLedger.setType(request.getType());
        stockLedger.setQuantity(request.getQuantity());
        stockLedger.setReferenceType(request.getReferenceType());
        stockLedger.setReferenceId(request.getReferenceId());
        stockLedger.setInventoryLot(inventoryLot);

        StockLedger saved = stockLedgerRepository.save(stockLedger);
        return mapToResponse(saved);
    }

    @Override
    @Transactional
    public StockLedgerResponse update(UUID id, StockLedgerRequest request) {
        StockLedger stockLedger = stockLedgerRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("StockLedger not found with id: " + id));

        InventoryLot inventoryLot = inventoryLotRepository.findById(request.getInventoryLotId())
                .orElseThrow(() -> new RuntimeException("InventoryLot not found with id: " + request.getInventoryLotId()));

        stockLedger.setType(request.getType());
        stockLedger.setQuantity(request.getQuantity());
        stockLedger.setReferenceType(request.getReferenceType());
        stockLedger.setReferenceId(request.getReferenceId());
        stockLedger.setInventoryLot(inventoryLot);

        StockLedger updated = stockLedgerRepository.save(stockLedger);
        return mapToResponse(updated);
    }

    @Override
    @Transactional(readOnly = true)
    public StockLedgerResponse getById(UUID id) {
        StockLedger stockLedger = stockLedgerRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("StockLedger not found with id: " + id));
        return mapToResponse(stockLedger);
    }

    @Override
    @Transactional(readOnly = true)
    public List<StockLedgerResponse> getAll() {
        return stockLedgerRepository.findAll().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public void delete(UUID id) {
        if (!stockLedgerRepository.existsById(id)) {
            throw new RuntimeException("StockLedger not found with id: " + id);
        }
        stockLedgerRepository.deleteById(id);
    }

    private StockLedgerResponse mapToResponse(StockLedger stockLedger) {
        InventoryLot inventoryLot = stockLedger.getInventoryLot();
        Pharmacist pharmacist = stockLedger.getPharmacist();
        return new StockLedgerResponse(
                stockLedger.getId(),
                stockLedger.getType(),
                stockLedger.getQuantity(),
                stockLedger.getReferenceType(),
                stockLedger.getReferenceId(),
                inventoryLot != null ? inventoryLot.getId() : null,
                pharmacist != null ? pharmacist.getUserId() : null
        );
    }
}

