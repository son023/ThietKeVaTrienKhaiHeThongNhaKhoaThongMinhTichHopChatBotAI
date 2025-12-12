package com.main_project.inventory_service.client;

import com.main_project.inventory_service.dto.MedicalHistoryResponseDTO;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

import java.util.UUID;


@FeignClient(
        name = "patient-service",
        url = "${patient.service.url:http://localhost:8089}" // URL của invoice-service
)
public interface PatientClient {

    @GetMapping("/patient-service/medical-histories/{id}")
    MedicalHistoryResponseDTO getMedicalHistory(@PathVariable UUID id);
}
