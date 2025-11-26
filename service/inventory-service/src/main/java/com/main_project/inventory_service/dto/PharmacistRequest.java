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
public class PharmacistRequest {
    @NotNull(message = "User ID is required")
    private UUID userId;
    
    @NotBlank(message = "Degree is required")
    private String degree;
    
    @NotBlank(message = "Certificate is required")
    private String certificate;
}
