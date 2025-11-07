package com.do_an.userservice.dto.request;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class CreateLabTechnicianRequestDTO {
    @NotNull
    @NotEmpty
    private String userId; // User ID đã tồn tại
    
    private String field; // Chuyên môn, lĩnh vực
}
