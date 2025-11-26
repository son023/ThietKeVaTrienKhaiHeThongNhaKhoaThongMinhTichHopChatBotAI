package com.main_project.inventory_service.dto;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class DispenseItemRequest {
    @NotNull(message = "Quantity is required")
    private Integer quantity;
    
    @NotNull(message = "Price at dispense is required")
    private Integer priceAtDispense;
    
    private String dosage;
    private String frequency;
    private String duration;
    private String usageInstructions;
    
    @NotNull(message = "Inventory Lot ID is required")
    private UUID inventoryLotId;
    
    @NotNull(message = "Dispense Order ID is required")
    private UUID dispenseOrderId;
}



