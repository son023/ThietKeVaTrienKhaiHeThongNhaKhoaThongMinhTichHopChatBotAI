package com.main_project.inventory_service.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ManualExportResponse {
    private UUID id; // StockLedger ID
    private UUID inventoryLotId;
    private String lotNo;
    private String medicineName;
    private Integer quantity;
    private String reason;
    private String notes;
    private LocalDateTime exportedAt;
    
    // New fields for enhanced export history
    private String pharmacistId; // Tên dược sĩ
    private UUID prescriptionId;   // ID đơn thuốc (prescription từ DispenseOrder)
    private UUID dispenseOrderId;  // ID phiếu cấp phát
    private String exportType;     // "MANUAL" hoặc "AUTO"
}

