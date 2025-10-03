package com.main_project.user_service.service;

import com.main_project.user_service.entity.Role;
import com.main_project.user_service.entity.User;
import com.main_project.user_service.entity.UserRole;
import com.main_project.user_service.exceptions.AppException;
import com.main_project.user_service.exceptions.enums.ErrorCode;
import com.main_project.user_service.repository.UserRoleRepository;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class UserRoleService {

    UserRoleRepository userRoleRepository;
    UserService userService;
    RoleService roleService;

    public UserRole assignRoleToUser(String userId, String roleId) {
        User user = userService.getById(userId);
        Role role = roleService.getRoleById(roleId);

        // Check if the role is already assigned
        if (userRoleRepository.existsByUserIdAndRoleId(userId, roleId)) {
            throw new AppException(ErrorCode.ROLE_ALREADY_ASSIGNED);
        }

        UserRole userRole = UserRole.builder()
                .userId(userId)
                .roleId(roleId)
                .user(user)
                .role(role)
                .build();

        return userRoleRepository.save(userRole);
    }

    public void removeRoleFromUser(String userId, String roleId) {
        if (!userRoleRepository.existsByUserIdAndRoleId(userId, roleId)) {
            throw new AppException(ErrorCode.ROLE_NOT_ASSIGNED);
        }
        userRoleRepository.deleteByUserIdAndRoleId(userId, roleId);
    }

    public List<UserRole> getUserRoles(String userId) {
        return userRoleRepository.findByUserId(userId);
    }

    public List<UserRole> getUsersByRole(String roleId) {
        return userRoleRepository.findByRoleId(roleId);
    }

    public void removeAllUserRoles(String userId) {
        userRoleRepository.deleteByUserId(userId);
    }
}
