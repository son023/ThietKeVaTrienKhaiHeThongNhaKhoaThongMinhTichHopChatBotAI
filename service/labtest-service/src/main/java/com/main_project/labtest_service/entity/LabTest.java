package com.main_project.labtest_service.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.ZonedDateTime;
import java.util.*;

@Entity
@Table(name = "lab_test")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LabTest {

    @Id
    @Column(length = 50)
    private UUID id;

    @Column(length = 50)
    private UUID labTechnicianId;

    @Column(length = 50)
    private UUID doctorId;

    private int price;

    @Column(length = 255)
    private String instructions;

    @Column(length = 255)
    private String status;

    private ZonedDateTime resultDate;

    @Column(length = 255)
    private String abnormalFlag;

    @Column(length = 255)
    private String units;

    @Column(length = 255)
    private String structureJson;

    @Column(length = 255)
    private String referenceRange;

    private ZonedDateTime createdAt;
    private ZonedDateTime updatedAt;

    // Many LabTests belong to one MedicalHistory
    @ManyToOne
    @JoinColumn(name = "medical_history_id", referencedColumnName = "id")
    private MedicalHistory medicalHistory;

    // Many LabTests belong to one LabTestType
    @ManyToOne
    @JoinColumn(name = "lab_test_type_id", referencedColumnName = "id")
    private LabTestType labTestType;

    // One LabTest has many MedicalAttachments
    @OneToMany(mappedBy = "labTest", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<MedicalAttachment> medicalAttachments = new ArrayList<>();
}
