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
public class InventoryAllocationRequest {
    private UUID medicineId;
    private Integer quantity;
    private UUID dispenseOrderId;
    private UUID pharmacistId; // Optional
}






