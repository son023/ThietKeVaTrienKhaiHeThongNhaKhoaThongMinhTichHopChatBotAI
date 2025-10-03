package com.main_project.user_service.service;

import com.main_project.user_service.entity.Role;
import com.main_project.user_service.exceptions.AppException;
import com.main_project.user_service.exceptions.enums.ErrorCode;
import com.main_project.user_service.repository.RoleRepository;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class RoleService {

    RoleRepository roleRepository;

    public Role createRole(String name) {
        if (roleRepository.existsByName(name)) {
            throw new AppException(ErrorCode.ROLE_ALREADY_EXISTS);
        }

        Role role = Role.builder()
                .id(UUID.randomUUID().toString())
                .name(name)
                .build();

        return roleRepository.save(role);
    }

    public Role getRoleByName(String name) {
        return roleRepository.findByName(name)
                .orElseThrow(() -> new AppException(ErrorCode.ROLE_NOT_FOUND));
    }

    public Role getRoleById(String id) {
        return roleRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.ROLE_NOT_FOUND));
    }

    public List<Role> getAllRoles() {
        return roleRepository.findAll();
    }

    public void deleteRole(String id) {
        if (!roleRepository.existsById(id)) {
            throw new AppException(ErrorCode.ROLE_NOT_FOUND);
        }
        roleRepository.deleteById(id);
    }
}
