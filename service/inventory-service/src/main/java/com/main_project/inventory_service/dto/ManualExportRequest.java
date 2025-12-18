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
public class ManualExportRequest {
    @NotNull(message = "Inventory Lot ID is required")
    private UUID inventoryLotId;
    
    @NotNull(message = "Quantity is required")
    private Integer quantity;
    
    @NotBlank(message = "Reason is required")
    private String reason; // "Hết hạn sử dụng", "Hư hỏng", "Chuyển kho", "Mất mát"
    
    private String notes;
    
    @NotNull(message = "Pharmacist ID is required")
    private UUID pharmacistId; // ID dược sĩ thực hiện xuất kho
}


