package com.main_project.inventory_service.iservice;

import com.main_project.inventory_service.dto.PharmacistRequest;
import com.main_project.inventory_service.dto.PharmacistResponse;

import java.util.List;
import java.util.UUID;

public interface IPharmacistService {
    PharmacistResponse createPharmacist(PharmacistRequest request);
    PharmacistResponse getPharmacist(UUID userId);
    List<PharmacistResponse> getAllPharmacists();
    PharmacistResponse updatePharmacist(UUID userId, PharmacistRequest request);
    void deletePharmacist(UUID userId);
}
