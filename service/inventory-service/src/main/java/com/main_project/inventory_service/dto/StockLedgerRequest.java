package com.main_project.inventory_service.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class StockLedgerRequest {
    @NotBlank(message = "Type is required")
    private String type; // 'IN', 'OUT', 'ADJUST'
    
    @NotNull(message = "Quantity is required")
    private Integer quantity;
    
    private String referenceType;
    
    private String referenceId;
    
    @NotNull(message = "Inventory Lot ID is required")
    private UUID inventoryLotId;
}



