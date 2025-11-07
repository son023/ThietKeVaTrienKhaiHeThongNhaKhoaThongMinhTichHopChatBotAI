package com.do_an.userservice.dto.request;

import lombok.Data;

import java.time.LocalDate;

@Data
public class UpdatePatientRequestDTO {
    private LocalDate dob; // Date of birth
    
    private String gender; // Giới tính
    
    private String address; // Địa chỉ
    
    private String bloodType; // Nhóm máu
    
    private String allergy; // Dị ứng
    
    private String insuranceNumber; // Số bảo hiểm y tế
    
    // Thông tin User (optional)
    private String fullName;
    private String phone;
    private String imageUrl;
}
