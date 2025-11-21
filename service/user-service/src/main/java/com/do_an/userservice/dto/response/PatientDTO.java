package com.do_an.userservice.dto.response;

import lombok.Data;

import java.time.LocalDate;
import java.util.UUID;

@Data
public class PatientDTO {
    private UUID id; // ID của hồ sơ Patient

    // Thông tin từ hồ sơ Patient
    private LocalDate dob;
    private String gender;
    private String address;
    private String bloodType;
    private String allergy;
    private String insuranceNumber;

    // Thông tin từ User
    private UUID userId;
    private String fullName;
    private String email;
    private String phone;
    private String imageUrl;
}
