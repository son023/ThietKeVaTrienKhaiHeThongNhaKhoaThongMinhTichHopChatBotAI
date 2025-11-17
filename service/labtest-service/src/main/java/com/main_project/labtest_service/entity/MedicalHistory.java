package com.main_project.labtest_service.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.time.ZonedDateTime;
import java.util.*;

@Entity
@Table(name = "medical_history")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MedicalHistory {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id; // varchar(50)

    @Column(length = 50)
    private UUID appointmentId;

    @Column(length = 255)
    private String symptoms;

    @Column(length = 255)
    private String treatment;

    @Column(length = 255)
    private String diagnosis;

    @Column(length = 255)
    private String disease;

    private ZonedDateTime createdAt;
    private ZonedDateTime updatedAt;

    // 1 MedicalHistory có nhiều LabTest
    @OneToMany(mappedBy = "medicalHistory", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<LabTest> labTests = new ArrayList<>();
}
