package com.main_project.doctor_profile_service.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDateTime;

@Entity
@Table(name = "department")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class Department {

    @Id
    @Column(name = "id", columnDefinition = "CHAR(36)")
    String id;

    @Column(name = "name", length = 100)
    String name;

    @Column(name = "description")
    String description;

    @Column(name = "head_of_department", length = 100)
    String headOfDepartment;

    @Column(name = "location", length = 100)
    String location;

    @Column(name = "phone", length = 20)
    String phone;

    @Column(name = "created_at", nullable = false)
    @Builder.Default
    LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "updated_at", nullable = false)
    @Builder.Default
    LocalDateTime updatedAt = LocalDateTime.now();
}



