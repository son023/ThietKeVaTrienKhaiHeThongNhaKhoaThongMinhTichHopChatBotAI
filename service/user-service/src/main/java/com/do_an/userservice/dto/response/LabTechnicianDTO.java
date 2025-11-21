package com.do_an.userservice.dto.response;

import lombok.Data;

import java.util.UUID;

@Data
public class LabTechnicianDTO {
    private UUID id; // ID của hồ sơ LabTechnician

    // Thông tin từ hồ sơ LabTechnician
    private String field; // Chuyên môn, lĩnh vực

    // Thông tin từ User
    private UUID userId;
    private String fullName;
    private String email;
    private String phone;
    private String imageUrl;
}
