package com.main_project.inventory_service.controller;

import com.main_project.inventory_service.dto.PharmacistRequest;
import com.main_project.inventory_service.dto.PharmacistResponse;
import com.main_project.inventory_service.iservice.IPharmacistService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/inventory-service/pharmacists")
@RequiredArgsConstructor
public class PharmacistController {

    @Autowired
    private IPharmacistService pharmacistService;

    @PostMapping
    public ResponseEntity<PharmacistResponse> createPharmacist(@Valid @RequestBody PharmacistRequest request) {
        PharmacistResponse response = pharmacistService.createPharmacist(request);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @GetMapping("/{userId}")
    public ResponseEntity<PharmacistResponse> getPharmacist(@PathVariable UUID userId) {
        PharmacistResponse response = pharmacistService.getPharmacist(userId);
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @GetMapping
    public ResponseEntity<List<PharmacistResponse>> getAllPharmacists() {
        List<PharmacistResponse> responses = pharmacistService.getAllPharmacists();
        return new ResponseEntity<>(responses, HttpStatus.OK);
    }

    @PutMapping("/{userId}")
    public ResponseEntity<PharmacistResponse> updatePharmacist(@PathVariable UUID userId, @Valid @RequestBody PharmacistRequest request) {
        PharmacistResponse response = pharmacistService.updatePharmacist(userId, request);
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @DeleteMapping("/{userId}")
    public ResponseEntity<Void> deletePharmacist(@PathVariable UUID userId) {
        pharmacistService.deletePharmacist(userId);
        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }
}
