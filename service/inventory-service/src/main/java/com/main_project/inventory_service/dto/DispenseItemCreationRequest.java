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
public class DispenseItemCreationRequest {
    private UUID dispenseItemId;
    private UUID dispenseOrderId;
    private UUID inventoryLotId;
    private UUID medicineId;
    private Integer quantity;
    private Integer priceAtDispense;
    private String dosage;
    private String duration;
    private String frequency;
    private String usageInstructions;
}






