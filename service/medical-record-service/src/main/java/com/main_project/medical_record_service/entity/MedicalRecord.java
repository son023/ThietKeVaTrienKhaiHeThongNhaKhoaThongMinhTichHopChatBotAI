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
@Table(name = "medical_record")
public class MedicalRecord {

    @Id
    @Column(length = 36)
    String id;

    @Column(name = "patient_id", length = 36, nullable = false)
    String patientId;

    @Column(name = "doctor_id", length = 36, nullable = false)
    String doctorId;

    @Column(name = "visit_date", nullable = false)
    LocalDateTime visitDate;

    @Column(columnDefinition = "TEXT")
    String symptoms;

    @Column(columnDefinition = "TEXT")
    String diagnosis;

    @Column(columnDefinition = "TEXT")
    String notes;

    Integer version;

    @Column(name = "created_at")
    LocalDateTime createdAt;

    @Column(name = "updated_at")
    LocalDateTime updatedAt;
}






