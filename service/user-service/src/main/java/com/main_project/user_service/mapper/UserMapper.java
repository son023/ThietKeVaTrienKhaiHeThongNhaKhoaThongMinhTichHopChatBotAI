package com.main_project.user_service.mapper;

import com.main_project.user_service.dto.RoleDTO;
import com.main_project.user_service.dto.UserDTO;
import com.main_project.user_service.entity.Role;
import com.main_project.user_service.entity.User;
import com.main_project.user_service.entity.UserRole;

import java.util.Set;
import java.util.stream.Collectors;

public final class UserMapper {

    private UserMapper() {}

    public static UserDTO toDto(User user) {
        if (user == null) {
            return null;
        }

        Set<RoleDTO> roles = null;
        if (user.getUserRoles() != null) {
            roles = user.getUserRoles()
                    .stream()
                    .map(UserRole::getRole)
                    .filter(role -> role != null)
                    .map(role -> new RoleDTO(role.getId(), role.getName()))
                    .collect(Collectors.toSet());
        }

        return UserDTO.builder()
                .id(user.getId())
                .username(user.getUsername())
                .email(user.getEmail())
                .phone(user.getPhone())
                .fullName(user.getFullName())
                .isEmailVerified(user.getIsEmailVerified())
                .isActive(user.getIsActive())
                .lastLoginAt(user.getLastLoginAt())
                .createdAt(user.getCreatedAt())
                .updatedAt(user.getUpdatedAt())
                .roles(roles)
                .build();
    }
}


