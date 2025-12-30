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
public class MedicineAllocationRequest {
    private UUID medicineId;
    private UUID dispenseOrderId;
    private Integer quantity;
    private Integer priceAtDispense;
    private String dosage;
    private String duration;
    private String frequency;
    private String usageInstructions;
    private UUID pharmacistId; // Optional
}






