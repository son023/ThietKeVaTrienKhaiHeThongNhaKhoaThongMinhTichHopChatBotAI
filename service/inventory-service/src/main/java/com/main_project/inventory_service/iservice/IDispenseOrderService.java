package com.main_project.inventory_service.iservice;

import com.main_project.inventory_service.dto.DispenseOrderRequest;
import com.main_project.inventory_service.dto.DispenseOrderResponse;

import java.util.List;
import java.util.UUID;

public interface IDispenseOrderService {
    DispenseOrderResponse create(DispenseOrderRequest request);
    DispenseOrderResponse update(UUID id, DispenseOrderRequest request);
    DispenseOrderResponse getById(UUID id);
    List<DispenseOrderResponse> getAll();
    void delete(UUID id);
}



