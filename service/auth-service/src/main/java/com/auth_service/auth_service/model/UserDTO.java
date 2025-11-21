package com.auth_service.auth_service.model;

import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDateTime;
import java.util.Set;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class UserDTO {
    UUID id;
    String username;
    String email;
    String phone;
    String fullName;
    Boolean isActive;
    String imageUrl;
    LocalDateTime createdAt;
    LocalDateTime updatedAt;

    Set<String> roles;
    
    // Thông tin cho JWT authentication
    String primaryRole; // Vai trò chính
    UUID profileId; // ID hồ sơ cụ thể
}


