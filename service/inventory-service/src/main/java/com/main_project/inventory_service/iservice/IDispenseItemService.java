package com.main_project.inventory_service.iservice;

import com.main_project.inventory_service.dto.DispenseItemRequest;
import com.main_project.inventory_service.dto.DispenseItemResponse;

import java.util.List;
import java.util.UUID;

public interface IDispenseItemService {
    DispenseItemResponse create(DispenseItemRequest request);
    DispenseItemResponse update(UUID id, DispenseItemRequest request);
    DispenseItemResponse getById(UUID id);
    List<DispenseItemResponse> getAll();
    void delete(UUID id);
}



