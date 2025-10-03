package com.main_project.medical_record_service.entity;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
@Entity
@Table(name = "medical_attachment")
public class MedicalAttachment {

    @Id
    @Column(length = 36)
    String id;

    @Column(name = "record_id", length = 36, nullable = false)
    String recordId;

    @Column(name = "file_path")
    String filePath;

    String type;

    @Column(name = "uploaded_at")
    LocalDateTime uploadedAt;
}






