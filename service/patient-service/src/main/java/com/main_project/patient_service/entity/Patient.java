package com.main_project.patient_service.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
@Entity
@Table(name = "patient")
public class Patient {

    @Id
    @Column(length = 36)
    String id;

    @Column(name = "user_id", length = 36, nullable = false)
    String userId;

    LocalDate dob;
    String gender;
    String address;
    @Column(name = "contact_phone")
    String contactPhone;
    @Column(name = "blood_type", length = 3)
    String bloodType;

    @Column(name = "created_at")
    LocalDateTime createdAt;

    @Column(name = "updated_at")
    LocalDateTime updatedAt;
}



