package com.main_project.inventory_service.service;

import com.main_project.inventory_service.dto.DispenseItemRequest;
import com.main_project.inventory_service.dto.DispenseItemResponse;
import com.main_project.inventory_service.entity.DispenseItem;
import com.main_project.inventory_service.entity.DispenseOrder;
import com.main_project.inventory_service.entity.InventoryLot;
import com.main_project.inventory_service.iservice.IDispenseItemService;
import com.main_project.inventory_service.repository.DispenseItemRepository;
import com.main_project.inventory_service.repository.DispenseOrderRepository;
import com.main_project.inventory_service.repository.InventoryLotRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DispenseItemService implements IDispenseItemService {

    private final DispenseItemRepository dispenseItemRepository;
    private final InventoryLotRepository inventoryLotRepository;
    private final DispenseOrderRepository dispenseOrderRepository;

    @Override
    @Transactional
    public DispenseItemResponse create(DispenseItemRequest request) {
        InventoryLot inventoryLot = inventoryLotRepository.findById(request.getInventoryLotId())
                .orElseThrow(() -> new RuntimeException("InventoryLot not found with id: " + request.getInventoryLotId()));

        DispenseOrder dispenseOrder = dispenseOrderRepository.findById(request.getDispenseOrderId())
                .orElseThrow(() -> new RuntimeException("DispenseOrder not found with id: " + request.getDispenseOrderId()));

        DispenseItem dispenseItem = new DispenseItem();
        dispenseItem.setQuantity(request.getQuantity());
        dispenseItem.setPriceAtDispense(request.getPriceAtDispense());
        dispenseItem.setDosage(request.getDosage());
        dispenseItem.setFrequency(request.getFrequency());
        dispenseItem.setDuration(request.getDuration());
        dispenseItem.setUsageInstructions(request.getUsageInstructions());
        dispenseItem.setInventoryLot(inventoryLot);
        dispenseItem.setDispenseOrder(dispenseOrder);

        DispenseItem saved = dispenseItemRepository.save(dispenseItem);
        return mapToResponse(saved);
    }

    @Override
    @Transactional
    public DispenseItemResponse update(UUID id, DispenseItemRequest request) {
        DispenseItem dispenseItem = dispenseItemRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("DispenseItem not found with id: " + id));

        InventoryLot inventoryLot = inventoryLotRepository.findById(request.getInventoryLotId())
                .orElseThrow(() -> new RuntimeException("InventoryLot not found with id: " + request.getInventoryLotId()));

        DispenseOrder dispenseOrder = dispenseOrderRepository.findById(request.getDispenseOrderId())
                .orElseThrow(() -> new RuntimeException("DispenseOrder not found with id: " + request.getDispenseOrderId()));

        dispenseItem.setQuantity(request.getQuantity());
        dispenseItem.setPriceAtDispense(request.getPriceAtDispense());
        dispenseItem.setDosage(request.getDosage());
        dispenseItem.setFrequency(request.getFrequency());
        dispenseItem.setDuration(request.getDuration());
        dispenseItem.setUsageInstructions(request.getUsageInstructions());
        dispenseItem.setInventoryLot(inventoryLot);
        dispenseItem.setDispenseOrder(dispenseOrder);

        DispenseItem updated = dispenseItemRepository.save(dispenseItem);
        return mapToResponse(updated);
    }

    @Override
    @Transactional(readOnly = true)
    public DispenseItemResponse getById(UUID id) {
        DispenseItem dispenseItem = dispenseItemRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("DispenseItem not found with id: " + id));
        return mapToResponse(dispenseItem);
    }

    @Override
    @Transactional(readOnly = true)
    public List<DispenseItemResponse> getAll() {
        return dispenseItemRepository.findAll().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public void delete(UUID id) {
        if (!dispenseItemRepository.existsById(id)) {
            throw new RuntimeException("DispenseItem not found with id: " + id);
        }
        dispenseItemRepository.deleteById(id);
    }

    @Override
    public List<DispenseItemResponse> getAllByDispenseOrderId(UUID dispenseOrderId) {
        return dispenseItemRepository.findAllByDispenseOrderId(dispenseOrderId)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    private DispenseItemResponse mapToResponse(DispenseItem dispenseItem) {
        InventoryLot inventoryLot = dispenseItem.getInventoryLot();
        DispenseOrder dispenseOrder = dispenseItem.getDispenseOrder();
        return new DispenseItemResponse(
                dispenseItem.getId(),
                dispenseItem.getQuantity(),
                dispenseItem.getPriceAtDispense(),
                dispenseItem.getDosage(),
                dispenseItem.getFrequency(),
                dispenseItem.getDuration(),
                dispenseItem.getUsageInstructions(),
                inventoryLot != null ? inventoryLot.getId() : null,
                dispenseOrder != null ? dispenseOrder.getId() : null
        );
    }
}

