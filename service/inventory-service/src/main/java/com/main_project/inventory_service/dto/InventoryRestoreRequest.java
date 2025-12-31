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
public class InventoryRestoreRequest {
    private UUID inventoryLotId;
    private Integer quantity;
    private UUID referenceId; // DispenseItem ID
    private UUID pharmacistId; // Optional
}






