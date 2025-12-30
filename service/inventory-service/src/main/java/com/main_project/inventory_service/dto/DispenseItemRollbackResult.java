package com.main_project.inventory_service.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

/**
 * Kết quả rollback từ DispenseItem
 * Chứa thông tin cần thiết để restore quantity về InventoryLot
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DispenseItemRollbackResult {
    private UUID inventoryLotId;
    private Integer quantity;
    private UUID pharmacistId; // Optional - ID của pharmacist thực hiện rollback
}


