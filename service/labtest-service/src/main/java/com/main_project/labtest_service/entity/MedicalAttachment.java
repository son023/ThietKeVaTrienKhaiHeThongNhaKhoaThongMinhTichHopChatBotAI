package com.main_project.labtest_service.entity;

import jakarta.persistence.*;
import lombok.*;
import java.util.UUID;
import java.time.ZonedDateTime;

@Entity
@Table(name = "medical_attachment")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MedicalAttachment {

    @Id
    @Column(columnDefinition = "uuid")
    private UUID id;

    @Column(name = "file_path", length = 500)
    private String filePath;

    @Column(length = 50)
    private String type;

    @Column(name = "created_at")
    private ZonedDateTime createdAt;
    
    @Column(name = "updated_at")
    private ZonedDateTime updatedAt;

    // Many attachments belong to one LabTest
    @ManyToOne
    @JoinColumn(name = "lab_test_id", referencedColumnName = "id")
    private LabTest labTest;

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
