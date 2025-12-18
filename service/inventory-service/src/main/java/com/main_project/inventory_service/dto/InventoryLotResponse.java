package com.main_project.inventory_service.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class InventoryLotResponse {
    private UUID id;
    private String lotNo;
    private LocalDate expireDate;
    private Integer quantityOnHand;
    private Integer costPrice;
    private UUID medicineId;
    private String medicineName;
    private UUID pharmacistId; // ID dược sĩ nhập kho
}



