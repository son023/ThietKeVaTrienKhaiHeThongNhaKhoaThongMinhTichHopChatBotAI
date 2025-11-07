package com.do_an.userservice.repository;

import com.do_an.userservice.entity.Admin;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface AdminRepository extends JpaRepository<Admin, String> {
    
    // Tìm Admin theo User ID
    Optional<Admin> findByUserId(String userId);
    
    // Tìm tất cả Admin
    List<Admin> findAll();
}
