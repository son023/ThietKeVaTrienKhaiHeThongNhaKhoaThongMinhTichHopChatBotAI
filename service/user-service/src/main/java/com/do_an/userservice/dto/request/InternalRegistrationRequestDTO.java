package com.do_an.userservice.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotEmpty;
import lombok.Data;

@Data
public class InternalRegistrationRequestDTO {
    // Thông tin cơ bản cho bảng User
    @NotEmpty @Email
    private String email;
    @NotEmpty
    private String username;
    @NotEmpty
    private String hashedPassword; // auth-service đã hash sẵn
    @NotEmpty
    private String fullName;
    private String phone;
}
