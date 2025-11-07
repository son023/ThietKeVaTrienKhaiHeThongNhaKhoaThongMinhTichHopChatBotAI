package com.do_an.userservice.dto.request;

import lombok.Data;

@Data
public class UpdatePharmacistRequestDTO {
    private String degree; // Bằng cấp
    
    private String certificate; // Chứng chỉ
    
    // Thông tin User (optional)
    private String fullName;
    private String phone;
    private String imageUrl;
}
