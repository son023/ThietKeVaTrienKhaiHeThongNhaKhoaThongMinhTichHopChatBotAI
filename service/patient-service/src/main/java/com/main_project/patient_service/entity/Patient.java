package com.main_project.patient_service.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "patient")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Patient {

    @Id
    @Column(name = "user_id", length = 50, nullable = false)
    private UUID userId;

    private LocalDate dob;

    @Column(length = 50)
    private String gender;

    @Column(columnDefinition = "TEXT")
    private String address;

    @Column(name = "contact_phone", length = 50)
    private String contactPhone;

    @Column(name = "blood_type", length = 10)
    private String bloodType;

    @Column(columnDefinition = "TEXT")
    private String allergy;

    @Column(name = "insurance_number", length = 100)
    private String insuranceNumber;

    @Builder.Default
    @OneToMany(mappedBy = "patient", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<MedicalHistory> medicalHistories = new ArrayList<>();
}
