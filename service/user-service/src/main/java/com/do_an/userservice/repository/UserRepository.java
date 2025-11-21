package com.do_an.userservice.repository;

import com.do_an.userservice.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface UserRepository extends JpaRepository<User, UUID> {
    
    Optional<User> findByUsername(String username);
    
    Optional<User> findByEmail(String email);
    
    // Tìm user theo username hoặc email
    Optional<User> findByUsernameOrEmail(String username, String email);
    
    // Tìm user theo trạng thái active
    List<User> findAllByIsActive(boolean isActive);
    
    // Tìm user theo fullName (chứa chuỗi)
    List<User> findAllByFullNameContainingIgnoreCase(String fullName);
    
    // Tìm user theo email (chứa chuỗi)
    List<User> findAllByEmailContainingIgnoreCase(String email);
    
    // Sắp xếp theo thời gian tạo giảm dần
    List<User> findAllByOrderByCreatedAtDesc();
    
    // Sắp xếp theo thời gian tạo tăng dần
    List<User> findAllByOrderByCreatedAtAsc();
}
