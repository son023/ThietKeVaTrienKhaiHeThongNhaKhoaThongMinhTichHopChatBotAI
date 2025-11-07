package com.do_an.userservice.dto.response;


import lombok.Builder;
import lombok.Data;

import java.util.Set;

@Data
@Builder
public class FullProfileDTO {
    // Thông tin cơ bản từ Bảng User
    private String userId;
    private String username;
    private String email;
    private String fullName;
    private String phone;
    private boolean isActive;
    private String imageUrl;
    private Set<String> roles; // Danh sách tên các vai trò

    // Các hồ sơ chuyên môn (sẽ null nếu không có)
    private PatientDTO patientProfile;
    private DoctorDTO doctorProfile;
    private PharmacistDTO pharmacistProfile;
    private LabTechnicianDTO labTechnicianProfile;
}
