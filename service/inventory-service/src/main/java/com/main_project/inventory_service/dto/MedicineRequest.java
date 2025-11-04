package com.main_project.inventory_service.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class MedicineRequest {
    @NotBlank(message = "Name is required")
    private String name;
    
    private String unit;
    private String description;
    private Integer salePrice;
}



