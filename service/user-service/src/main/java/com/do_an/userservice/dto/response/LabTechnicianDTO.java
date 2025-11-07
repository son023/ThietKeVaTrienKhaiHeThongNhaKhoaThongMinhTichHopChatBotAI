package com.do_an.userservice.dto.response;

import lombok.Data;

@Data
public class LabTechnicianDTO {
    private String id; // ID của hồ sơ LabTechnician

    // Thông tin từ hồ sơ LabTechnician
    private String field; // Chuyên môn, lĩnh vực

    // Thông tin từ User
    private String userId;
    private String fullName;
    private String email;
    private String phone;
    private String imageUrl;
}
