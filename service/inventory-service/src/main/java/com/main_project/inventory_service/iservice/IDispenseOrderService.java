package com.main_project.inventory_service.iservice;

import com.main_project.inventory_service.dto.DispenseOrderRequest;
import com.main_project.inventory_service.dto.DispenseOrderResponse;

import java.util.List;
import java.util.Map;
import java.util.UUID;

public interface IDispenseOrderService {
    DispenseOrderResponse create(DispenseOrderRequest request);
    DispenseOrderResponse update(UUID id, DispenseOrderRequest request);
    DispenseOrderResponse getById(UUID id);
    List<DispenseOrderResponse> getAll();
    void delete(UUID id);

    DispenseOrderResponse markAsSold(UUID id, UUID pharmacistId);

    DispenseOrderResponse getByPrescriptionId(UUID id);

    List<DispenseOrderResponse> getAllByStatus(String status);
    List<DispenseOrderResponse> getAllByStatuses(List<String> statuses);

    Map<String, Object> getPaymentStatusOfPrescription(UUID dispenseOrderId);

    DispenseOrderResponse getByMedicalHistoryId(UUID id);

    Map<String, Object> getPrescriptionStatusByMedicalHistoryId(UUID medicalHistoryId);
}



