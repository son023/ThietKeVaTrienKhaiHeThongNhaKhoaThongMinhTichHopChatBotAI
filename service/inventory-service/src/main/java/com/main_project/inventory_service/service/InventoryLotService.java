package com.main_project.inventory_service.service;

import com.main_project.inventory_service.dto.InventoryLotRequest;
import com.main_project.inventory_service.dto.InventoryLotResponse;
import com.main_project.inventory_service.entity.InventoryLot;
import com.main_project.inventory_service.entity.Medicine;
import com.main_project.inventory_service.iservice.IInventoryLotService;
import com.main_project.inventory_service.repository.InventoryLotRepository;
import com.main_project.inventory_service.repository.MedicineRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class InventoryLotService implements IInventoryLotService {

    private final InventoryLotRepository inventoryLotRepository;
    private final MedicineRepository medicineRepository;

    @Override
    @Transactional
    public InventoryLotResponse create(InventoryLotRequest request) {
        Medicine medicine = medicineRepository.findById(request.getMedicineId())
                .orElseThrow(() -> new RuntimeException("Medicine not found with id: " + request.getMedicineId()));

        InventoryLot inventoryLot = new InventoryLot();
        inventoryLot.setLotNo(request.getLotNo());
        inventoryLot.setExpireDate(request.getExpireDate());
        inventoryLot.setQuantityOnHand(request.getQuantityOnHand() != null ? request.getQuantityOnHand() : 0);
        inventoryLot.setCostPrice(request.getCostPrice());
        inventoryLot.setMedicine(medicine);

        InventoryLot saved = inventoryLotRepository.save(inventoryLot);
        return mapToResponse(saved);
    }

    @Override
    @Transactional
    public InventoryLotResponse update(UUID id, InventoryLotRequest request) {
        InventoryLot inventoryLot = inventoryLotRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("InventoryLot not found with id: " + id));

        Medicine medicine = medicineRepository.findById(request.getMedicineId())
                .orElseThrow(() -> new RuntimeException("Medicine not found with id: " + request.getMedicineId()));

        inventoryLot.setLotNo(request.getLotNo());
        inventoryLot.setExpireDate(request.getExpireDate());
        inventoryLot.setQuantityOnHand(request.getQuantityOnHand() != null ? request.getQuantityOnHand() : 0);
        inventoryLot.setCostPrice(request.getCostPrice());
        inventoryLot.setMedicine(medicine);

        InventoryLot updated = inventoryLotRepository.save(inventoryLot);
        return mapToResponse(updated);
    }

    @Override
    @Transactional(readOnly = true)
    public InventoryLotResponse getById(UUID id) {
        InventoryLot inventoryLot = inventoryLotRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("InventoryLot not found with id: " + id));
        return mapToResponse(inventoryLot);
    }

    @Override
    @Transactional(readOnly = true)
    public List<InventoryLotResponse> getAll() {
        return inventoryLotRepository.findAll().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public void delete(UUID id) {
        if (!inventoryLotRepository.existsById(id)) {
            throw new RuntimeException("InventoryLot not found with id: " + id);
        }
        inventoryLotRepository.deleteById(id);
    }

    private InventoryLotResponse mapToResponse(InventoryLot inventoryLot) {
        Medicine medicine = inventoryLot.getMedicine();
        return new InventoryLotResponse(
                inventoryLot.getId(),
                inventoryLot.getLotNo(),
                inventoryLot.getExpireDate(),
                inventoryLot.getQuantityOnHand(),
                inventoryLot.getCostPrice(),
                medicine != null ? medicine.getId() : null,
                medicine != null ? medicine.getName() : null
        );
    }
}

