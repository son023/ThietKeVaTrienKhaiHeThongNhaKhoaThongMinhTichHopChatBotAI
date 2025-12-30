package com.main_project.inventory_service.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DispenseOrderCreationRequest {
    private UUID dispenseOrderId;
    private UUID prescriptionId;
    private UUID doctorId;
    private UUID medicalHistoryId;
    private UUID pharmacistId; // Optional
}






