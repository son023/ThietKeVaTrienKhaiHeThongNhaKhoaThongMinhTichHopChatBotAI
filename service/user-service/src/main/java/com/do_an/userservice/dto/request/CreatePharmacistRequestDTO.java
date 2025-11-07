package com.do_an.userservice.dto.request;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class CreatePharmacistRequestDTO {
    @NotNull
    @NotEmpty
    private String userId; // User ID đã tồn tại
    
    private String degree; // Bằng cấp
    
    private String certificate; // Chứng chỉ
}
