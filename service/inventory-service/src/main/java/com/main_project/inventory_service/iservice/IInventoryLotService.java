package com.main_project.inventory_service.iservice;

import com.main_project.inventory_service.dto.InventoryLotRequest;
import com.main_project.inventory_service.dto.InventoryLotResponse;

import java.util.List;
import java.util.UUID;

public interface IInventoryLotService {
    InventoryLotResponse create(InventoryLotRequest request);
    InventoryLotResponse update(UUID id, InventoryLotRequest request);
    InventoryLotResponse getById(UUID id);
    List<InventoryLotResponse> getAll();
    void delete(UUID id);
}



