package com.main_project.doctor_service.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "doctor")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Doctor {

    @Id
    @Column(name = "user_id", length = 50, nullable = false)
    private UUID userId;

    @Column(name = "specialization_code", length = 100)
    private String specializationCode;

    @Column(name = "working_hospital", length = 255)
    private String workingHospital;

    @Column(name = "license_number", length = 100)
    private String licenseNumber;

    @Column(name = "consultation_fee_amount")
    private Integer consultationFeeAmount;

    @Builder.Default
    @OneToMany(mappedBy = "doctor", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<DoctorDegree> degrees = new ArrayList<>();

    @Builder.Default
    @OneToMany(mappedBy = "doctor", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<DoctorWorkSchedule> doctorWorkSchedules = new ArrayList<>();
}
