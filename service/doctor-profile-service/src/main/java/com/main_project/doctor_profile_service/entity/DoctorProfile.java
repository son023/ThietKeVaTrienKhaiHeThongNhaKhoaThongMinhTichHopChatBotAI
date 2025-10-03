package com.main_project.doctor_profile_service.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "doctor_profile")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class DoctorProfile {

    @Id
    @Column(name = "id", columnDefinition = "CHAR(36)")
    String id;

    @Column(name = "user_id", nullable = false, columnDefinition = "CHAR(36)")
    String userId;

    @Column(name = "doctor_code", length = 20)
    String doctorCode;

    @Column(name = "specialization_code", length = 50)
    String specializationCode;

    @Column(name = "working_hospital", length = 100)
    String workingHospital;

    @Column(name = "license_number", length = 50)
    String licenseNumber;

    @Column(name = "consultation_fee_amount", precision = 10, scale = 2)
    BigDecimal consultationFeeAmount;

    @Column(name = "consultation_fee_currency", length = 3)
    String consultationFeeCurrency;

    @Column(name = "phone", length = 20)
    String phone;

    @Column(name = "email", length = 100)
    String email;

    @Column(name = "created_at", nullable = false)
    @Builder.Default
    LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "updated_at", nullable = false)
    @Builder.Default
    LocalDateTime updatedAt = LocalDateTime.now();
}



