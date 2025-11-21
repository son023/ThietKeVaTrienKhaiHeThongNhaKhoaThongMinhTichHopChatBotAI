package com.do_an.userservice.dto.request;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDate;
import java.util.UUID;

@Data
public class CreatePatientRequestDTO {
    @NotNull
    private UUID userId; // User ID đã tồn tại
    
    private LocalDate dob; // Date of birth
    
    private String gender; // Giới tính
    
    private String address; // Địa chỉ
    
    private String bloodType; // Nhóm máu
    
    private String allergy; // Dị ứng
    
    private String insuranceNumber; // Số bảo hiểm y tế
}
