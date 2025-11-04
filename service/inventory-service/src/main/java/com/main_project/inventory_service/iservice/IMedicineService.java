package com.main_project.inventory_service.iservice;

import com.main_project.inventory_service.dto.MedicineRequest;
import com.main_project.inventory_service.dto.MedicineResponse;

import java.util.List;
import java.util.UUID;

public interface IMedicineService {
    MedicineResponse create(MedicineRequest request);
    MedicineResponse update(UUID id, MedicineRequest request);
    MedicineResponse getById(UUID id);
    List<MedicineResponse> getAll();
    void delete(UUID id);
}



