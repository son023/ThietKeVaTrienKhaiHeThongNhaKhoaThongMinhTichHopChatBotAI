package com.main_project.inventory_service.dto;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class DispenseOrderRequest {
    @NotNull(message = "Pharmacist ID is required")
    private UUID pharmacistId;
    
    private String prescription;
    private String status;
    private String medicalHistoryId;
    private String doctorId;
}



