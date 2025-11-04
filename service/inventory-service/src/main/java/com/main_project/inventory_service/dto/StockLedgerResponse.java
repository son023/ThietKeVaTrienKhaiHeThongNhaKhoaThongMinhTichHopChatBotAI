package com.main_project.inventory_service.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class StockLedgerResponse {
    private UUID id;
    private String lot;
    private String type;
    private Integer quantity;
    private String referenceType;
    private UUID inventoryLotId;
}



