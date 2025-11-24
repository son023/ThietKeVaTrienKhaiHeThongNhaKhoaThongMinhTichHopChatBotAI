package com.main_project.labtest_service.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.ZonedDateTime;
import java.util.*;
import com.main_project.labtest_service.entity.LabTechnician;

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

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "lab_technician_id", referencedColumnName = "user_id")
    private LabTechnician labTechnician;

    // Many LabTests belong to one LabTestType
    @ManyToOne
    @JoinColumn(name = "lab_test_type_id", referencedColumnName = "id")
    private LabTestType labTestType;

    // One LabTest has many MedicalAttachments
    @OneToMany(mappedBy = "labTest", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<MedicalAttachment> medicalAttachments = new ArrayList<>();

    @PrePersist
    public void onCreate() {
        if (id == null) {
            id = UUID.randomUUID();
        }
        createdAt = ZonedDateTime.now();
        updatedAt = createdAt;
    }

    @PreUpdate
    public void onUpdate() {
        updatedAt = ZonedDateTime.now();
    }
}
