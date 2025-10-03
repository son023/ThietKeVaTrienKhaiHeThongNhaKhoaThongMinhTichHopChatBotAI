package com.auth_service.auth_service.model;

import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDateTime;
import java.util.Set;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class UserDTO {
    String id;
    String username;
    String email;
    String phone;
    String fullName;
    Boolean isEmailVerified;
    Boolean isActive;
    LocalDateTime lastLoginAt;
    LocalDateTime createdAt;
    LocalDateTime updatedAt;

    Set<RoleDTO> roles;
}


