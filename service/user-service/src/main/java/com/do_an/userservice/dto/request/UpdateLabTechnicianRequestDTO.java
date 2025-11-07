package com.do_an.userservice.dto.request;

import lombok.Data;

@Data
public class UpdateLabTechnicianRequestDTO {
    private String field; // Chuyên môn, lĩnh vực
    
    // Thông tin User (optional)
    private String fullName;
    private String phone;
    private String imageUrl;
}
