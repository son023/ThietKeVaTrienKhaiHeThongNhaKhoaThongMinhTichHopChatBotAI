package com.main_project.inventory_service.service;

import com.main_project.inventory_service.dto.PharmacistRequest;
import com.main_project.inventory_service.dto.PharmacistResponse;
import com.main_project.inventory_service.entity.Pharmacist;
import com.main_project.inventory_service.exceptions.AppException;
import com.main_project.inventory_service.exceptions.enums.ErrorCode;
import com.main_project.inventory_service.iservice.IPharmacistService;
import com.main_project.inventory_service.repository.PharmacistRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class PharmacistService implements IPharmacistService {

    @Autowired
    private PharmacistRepository pharmacistRepository;

    @Override
    public PharmacistResponse createPharmacist(PharmacistRequest request) {
        if (pharmacistRepository.existsById(request.getUserId())) {
            throw new AppException(ErrorCode.PHARMACIST_EXISTED);
        }
        
        Pharmacist pharmacist = new Pharmacist();
        pharmacist.setUserId(request.getUserId());
        pharmacist.setDegree(request.getDegree());
        pharmacist.setCertificate(request.getCertificate());

        try {
            Pharmacist savedPharmacist = pharmacistRepository.save(pharmacist);
            return convertToResponse(savedPharmacist);
        } catch (Exception e) {
            throw new RuntimeException("Failed to create pharmacist: " + e.getMessage(), e);
        }
    }

    @Override
    public PharmacistResponse getPharmacist(UUID userId) {
        Pharmacist pharmacist = pharmacistRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Pharmacist not found with userId: " + userId));
        return convertToResponse(pharmacist);
    }

    @Override
    public List<PharmacistResponse> getAllPharmacists() {
        List<Pharmacist> pharmacists = pharmacistRepository.findAll();
        return pharmacists.stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public PharmacistResponse updatePharmacist(UUID userId, PharmacistRequest request) {
        Pharmacist pharmacist = pharmacistRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Pharmacist not found with userId: " + userId));

        pharmacist.setDegree(request.getDegree());
        pharmacist.setCertificate(request.getCertificate());

        Pharmacist updatedPharmacist = pharmacistRepository.save(pharmacist);
        return convertToResponse(updatedPharmacist);
    }

    @Override
    public void deletePharmacist(UUID userId) {
        if (!pharmacistRepository.existsById(userId)) {
            throw new RuntimeException("Pharmacist not found with userId: " + userId);
        }
        pharmacistRepository.deleteById(userId);
    }

    private PharmacistResponse convertToResponse(Pharmacist pharmacist) {
        return new PharmacistResponse(
                pharmacist.getUserId(),
                pharmacist.getDegree(),
                pharmacist.getCertificate()
        );
    }
}
