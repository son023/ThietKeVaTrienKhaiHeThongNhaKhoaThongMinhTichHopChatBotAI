package com.do_an.userservice.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotEmpty;
import lombok.Data;

import java.util.List;

@Data
public class CreateUserRequestDTO {
    @NotEmpty
    private String username;
    
    @NotEmpty
    @Email
    private String email;
    
    @NotEmpty
    private String hashedPassword; // Password đã được hash từ auth-service
    
    @NotEmpty
    private String fullName;
    
    private String phone;
    
    private String imageUrl;
    
    private boolean isActive = true;
    
    private List<String> roleNames; // Danh sách tên role (ví dụ: ["PATIENT", "DOCTOR"])
}
