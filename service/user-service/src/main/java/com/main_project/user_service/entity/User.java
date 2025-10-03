package com.main_project.user_service.entity;

import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDateTime;
import java.util.Set;

@Entity
@Table(name = "user")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class User {
    @Id
    @Column(name = "id", columnDefinition = "CHAR(36)")
    String id;

    @Column(name = "username", nullable = false, unique = true, length = 50)
    String username;

    @Column(name = "password_hash", nullable = false, length = 255)
    String passwordHash;

    @Column(name = "email", nullable = false, unique = true, length = 100)
    String email;

    @Column(name = "is_email_verified", nullable = false)
    @Builder.Default
    Boolean isEmailVerified = false;

    @Column(name = "phone", length = 20)
    String phone;

    @Column(name = "full_name", length = 100)
    String fullName;

    @Column(name = "last_login_at")
    LocalDateTime lastLoginAt;

    @Column(name = "password_updated_at")
    LocalDateTime passwordUpdatedAt;

    @Column(name = "is_active", nullable = false)
    @Builder.Default
    Boolean isActive = true;

    @Column(name = "created_at", nullable = false)
    @Builder.Default
    LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "updated_at", nullable = false)
    @Builder.Default
    LocalDateTime updatedAt = LocalDateTime.now();

    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    Set<UserRole> userRoles;

    @PreUpdate
    public void preUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}
