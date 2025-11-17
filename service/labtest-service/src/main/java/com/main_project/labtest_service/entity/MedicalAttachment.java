package com.main_project.labtest_service.entity;

import jakarta.persistence.*;
import lombok.*;
import java.util.UUID;
import java.time.ZonedDateTime;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "medical_attachment")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MedicalAttachment {

    @Id
    @Column(length = 50)
    private UUID id;

    @Column(length = 255)
    private String filePath;

    @Column(length = 255)
    private String type;

    private ZonedDateTime createdAt;
    private ZonedDateTime updatedAt;

    // Many attachments belong to one LabTest
    @ManyToOne
    @JoinColumn(name = "lab_test_id", referencedColumnName = "id")
    private LabTest labTest;
}
