package com.main_project.inventory_service.iservice;

import com.main_project.inventory_service.dto.*;
import com.main_project.inventory_service.entity.StockLedger;

import java.util.List;
import java.util.UUID;

public interface IInventoryLotService {
    InventoryLotResponse create(InventoryLotRequest request);
    InventoryLotResponse update(UUID id, InventoryLotRequest request);
    InventoryLotResponse getById(UUID id);
    List<InventoryLotResponse> getAll();
    void delete(UUID id);
    
    // Manual export methods
    ManualExportResponse exportStock(ManualExportRequest request);
    List<ManualExportResponse> getAllExports(); // Get ALL exports (manual + auto)
    List<ManualExportResponse> getAllManualExports();
    List<StockLedgerResponse> getStockLedgersByLotId(UUID lotId);
}



