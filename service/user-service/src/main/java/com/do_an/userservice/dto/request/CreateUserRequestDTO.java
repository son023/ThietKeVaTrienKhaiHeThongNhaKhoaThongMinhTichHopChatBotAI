package com.do_an.userservice.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotEmpty;
import lombok.Data;

import java.util.List;

@Data
public class CreateUserRequestDTO {
    
    @NotEmpty
    @Email
    private String email;
    
    @NotEmpty
    private String password; 
    
    @NotEmpty
    private String fullName;
    @NotEmpty
    private String phone;
    
    private String imageUrl;
    
    private boolean isActive = true;
    
    private List<String> roleNames;
}
