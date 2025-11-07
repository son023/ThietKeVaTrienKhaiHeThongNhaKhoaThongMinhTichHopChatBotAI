package com.do_an.userservice.repository;

import com.do_an.userservice.entity.Role;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface RoleRepository extends JpaRepository<Role, String> {
    Optional<Role> findByRoleName(String roleName);

    boolean existsById(String roleId);
}
