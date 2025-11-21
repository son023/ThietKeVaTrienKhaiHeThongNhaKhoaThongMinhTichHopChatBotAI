package com.do_an.userservice.dto.response;

import lombok.Data;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.Set;
import java.util.UUID;

@Data
@Getter
@Setter
public class UserDTO {
    private UUID id; // ID của User
    private String username;
    private String email;
    private String fullName;
    private String phone;
    private boolean isActive; // Rất quan trọng cho Admin
    private String imageUrl;
    private LocalDateTime createdAt; // Hữu ích để sắp xếp

    // Admin chắc chắn muốn biết user này có những quyền gì
    private Set<String> roles;
    
    // Thông tin cho JWT authentication
    private String primaryRole;
    private UUID profileId;
}
