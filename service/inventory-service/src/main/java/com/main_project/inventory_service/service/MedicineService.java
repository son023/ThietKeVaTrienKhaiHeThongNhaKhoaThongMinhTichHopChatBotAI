package com.main_project.inventory_service.service;

import com.main_project.inventory_service.dto.MedicineRequest;
import com.main_project.inventory_service.dto.MedicineResponse;
import com.main_project.inventory_service.entity.Medicine;
import com.main_project.inventory_service.iservice.IMedicineService;
import com.main_project.inventory_service.repository.MedicineRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class MedicineService implements IMedicineService {

    private final MedicineRepository medicineRepository;

    @Override
    @Transactional
    public MedicineResponse create(MedicineRequest request) {
        Medicine medicine = new Medicine();
        medicine.setName(request.getName());
        medicine.setUnit(request.getUnit());
        medicine.setDescription(request.getDescription());
        medicine.setSalePrice(request.getSalePrice());
        
        Medicine saved = medicineRepository.save(medicine);
        return mapToResponse(saved);
    }

    @Override
    @Transactional
    public MedicineResponse update(UUID id, MedicineRequest request) {
        Medicine medicine = medicineRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Medicine not found with id: " + id));
        
        medicine.setName(request.getName());
        medicine.setUnit(request.getUnit());
        medicine.setDescription(request.getDescription());
        medicine.setSalePrice(request.getSalePrice());
        
        Medicine updated = medicineRepository.save(medicine);
        return mapToResponse(updated);
    }

    @Override
    @Transactional(readOnly = true)
    public MedicineResponse getById(UUID id) {
        Medicine medicine = medicineRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Medicine not found with id: " + id));
        return mapToResponse(medicine);
    }

    @Override
    @Transactional(readOnly = true)
    public List<MedicineResponse> getAll() {
        return medicineRepository.findAll().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public void delete(UUID id) {
        if (!medicineRepository.existsById(id)) {
            throw new RuntimeException("Medicine not found with id: " + id);
        }
        medicineRepository.deleteById(id);
    }

    private MedicineResponse mapToResponse(Medicine medicine) {
        return new MedicineResponse(
                medicine.getId(),
                medicine.getName(),
                medicine.getUnit(),
                medicine.getDescription(),
                medicine.getSalePrice()
        );
    }
}



