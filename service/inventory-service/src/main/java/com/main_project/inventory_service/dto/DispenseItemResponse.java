package com.main_project.inventory_service.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class DispenseItemResponse {
    private UUID id;
    private Integer quantity;
    private Integer priceAtDispense;
    private String dosage;
    private String frequency;
    private String duration;
    private String usageInstructions;
    private UUID inventoryLotId;
    private UUID dispenseOrderId;
}



