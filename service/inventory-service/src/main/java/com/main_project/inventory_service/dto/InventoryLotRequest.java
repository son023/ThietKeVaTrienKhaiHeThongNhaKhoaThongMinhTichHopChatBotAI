package com.main_project.inventory_service.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class InventoryLotRequest {
    @NotBlank(message = "Lot number is required")
    private String lotNo;
    
    private LocalDate expireDate;
    private Integer quantityOnHand;
    private Integer costPrice;
    
    @NotNull(message = "Medicine ID is required")
    private UUID medicineId;
}



