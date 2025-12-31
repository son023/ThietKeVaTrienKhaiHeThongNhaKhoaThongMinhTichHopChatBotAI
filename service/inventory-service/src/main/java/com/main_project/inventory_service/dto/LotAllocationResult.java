package com.main_project.inventory_service.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

/**
 * Kết quả phân bổ từ InventoryLot
 * Chứa thông tin về lot đã được phân bổ và số lượng
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LotAllocationResult {
    private UUID inventoryLotId;
    private Integer quantity;
    private Integer priceAtDispense; // Giá tại thời điểm dispense
}


