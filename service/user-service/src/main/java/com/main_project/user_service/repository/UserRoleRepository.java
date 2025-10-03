package com.main_project.user_service.repository;

import com.main_project.user_service.entity.UserRole;
import com.main_project.user_service.entity.UserRoleId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface UserRoleRepository extends JpaRepository<UserRole, UserRoleId> {
    List<UserRole> findByUserId(String userId);
    List<UserRole> findByRoleId(String roleId);
    void deleteByUserId(String userId);
    void deleteByUserIdAndRoleId(String userId, String roleId);
    boolean existsByUserIdAndRoleId(String userId, String roleId);
}
