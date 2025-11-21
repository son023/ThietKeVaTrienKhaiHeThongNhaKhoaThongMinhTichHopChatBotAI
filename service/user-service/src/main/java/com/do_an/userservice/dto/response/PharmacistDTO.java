package com.do_an.userservice.dto.response;

import lombok.Data;

import java.util.UUID;

@Data
public class PharmacistDTO {
    private UUID id; // ID của hồ sơ Pharmacist

    // Thông tin từ hồ sơ Pharmacist
    private String degree;
    private String certificate;

    // Thông tin từ User
    private UUID userId;
    private String fullName;
    private String email;
    private String phone;
    private String imageUrl;
}
