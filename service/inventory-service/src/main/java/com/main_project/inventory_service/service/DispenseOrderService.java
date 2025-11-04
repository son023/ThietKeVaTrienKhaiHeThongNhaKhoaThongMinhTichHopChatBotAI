package com.main_project.inventory_service.service;

import com.main_project.inventory_service.dto.DispenseOrderRequest;
import com.main_project.inventory_service.dto.DispenseOrderResponse;
import com.main_project.inventory_service.entity.DispenseOrder;
import com.main_project.inventory_service.iservice.IDispenseOrderService;
import com.main_project.inventory_service.repository.DispenseOrderRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DispenseOrderService implements IDispenseOrderService {

    private final DispenseOrderRepository dispenseOrderRepository;

    @Override
    @Transactional
    public DispenseOrderResponse create(DispenseOrderRequest request) {
        DispenseOrder dispenseOrder = new DispenseOrder();
        dispenseOrder.setPharmacistId(request.getPharmacistId());
        dispenseOrder.setPrescription(request.getPrescription());
        dispenseOrder.setStatus(request.getStatus());

        DispenseOrder saved = dispenseOrderRepository.save(dispenseOrder);
        return mapToResponse(saved);
    }

    @Override
    @Transactional
    public DispenseOrderResponse update(UUID id, DispenseOrderRequest request) {
        DispenseOrder dispenseOrder = dispenseOrderRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("DispenseOrder not found with id: " + id));

        dispenseOrder.setPharmacistId(request.getPharmacistId());
        dispenseOrder.setPrescription(request.getPrescription());
        dispenseOrder.setStatus(request.getStatus());

        DispenseOrder updated = dispenseOrderRepository.save(dispenseOrder);
        return mapToResponse(updated);
    }

    @Override
    @Transactional(readOnly = true)
    public DispenseOrderResponse getById(UUID id) {
        DispenseOrder dispenseOrder = dispenseOrderRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("DispenseOrder not found with id: " + id));
        return mapToResponse(dispenseOrder);
    }

    @Override
    @Transactional(readOnly = true)
    public List<DispenseOrderResponse> getAll() {
        return dispenseOrderRepository.findAll().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public void delete(UUID id) {
        if (!dispenseOrderRepository.existsById(id)) {
            throw new RuntimeException("DispenseOrder not found with id: " + id);
        }
        dispenseOrderRepository.deleteById(id);
    }

    private DispenseOrderResponse mapToResponse(DispenseOrder dispenseOrder) {
        return new DispenseOrderResponse(
                dispenseOrder.getId(),
                dispenseOrder.getPharmacistId(),
                dispenseOrder.getPrescription(),
                dispenseOrder.getStatus(),
                dispenseOrder.getCreateAt(),
                dispenseOrder.getUpdateAt()
        );
    }
}



