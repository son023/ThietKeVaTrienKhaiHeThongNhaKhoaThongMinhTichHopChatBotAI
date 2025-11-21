package com.do_an.userservice.dto.request;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.util.UUID;

@Data
public class CreatePharmacistRequestDTO {
    @NotNull
    private UUID userId; // User ID đã tồn tại
    
    private String degree; // Bằng cấp
    
    private String certificate; // Chứng chỉ
}
