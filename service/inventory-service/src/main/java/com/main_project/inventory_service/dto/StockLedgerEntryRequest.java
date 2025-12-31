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
public class StockLedgerEntryRequest {
    private UUID inventoryLotId;
    private UUID pharmacistId;
    private String type; // "IN", "OUT", "ADJUST"
    private Integer quantity;
    private String referenceType; // "MANUAL_IMPORT", "AUTO_DISPENSE", etc.
    private UUID referenceId;
}






