package com.main_project.inventory_service.iservice;

import com.main_project.inventory_service.dto.StockLedgerRequest;
import com.main_project.inventory_service.dto.StockLedgerResponse;

import java.util.List;
import java.util.UUID;

public interface IStockLedgerService {
    StockLedgerResponse create(StockLedgerRequest request);
    StockLedgerResponse update(UUID id, StockLedgerRequest request);
    StockLedgerResponse getById(UUID id);
    List<StockLedgerResponse> getAll();
    void delete(UUID id);
}



