package com.do_an.userservice.dto.request;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDate;

@Data
public class CreatePatientRequestDTO {
    @NotNull
    @NotEmpty
    private String userId; // User ID đã tồn tại
    
    private LocalDate dob; // Date of birth
    
    private String gender; // Giới tính
    
    private String address; // Địa chỉ
    
    private String bloodType; // Nhóm máu
    
    private String allergy; // Dị ứng
    
    private String insuranceNumber; // Số bảo hiểm y tế
}
