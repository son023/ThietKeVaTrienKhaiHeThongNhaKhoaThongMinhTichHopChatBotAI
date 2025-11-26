package com.main_project.patient_service.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.ZoneOffset;
import java.time.ZonedDateTime;
import java.util.UUID;

@Entity
@Table(name = "medical_history")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MedicalHistory {

    @Id
    @Column(length = 50)
    private UUID id;

    @Column(name = "appointment_id", length = 50)
    private UUID appointmentId;

    @Column(length = 255)
    private String symptoms;

    @Column(length = 255)
    private String treatment;

    @Column(length = 255)
    private String diagnosis;

    @Column(length = 255)
    private String disease;

    @Column(name = "created_at")
    private ZonedDateTime createdAt;

    @Column(name = "updated_at")
    private ZonedDateTime updatedAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "patient_profile_id", referencedColumnName = "user_id")
    private Patient patient;

    @PrePersist
    public void onCreate() {
        if (id == null || id.toString().isBlank()) {
            id = UUID.randomUUID();
        }
        createdAt = ZonedDateTime.now(ZoneOffset.UTC);
        updatedAt = createdAt;
    }

    @PreUpdate
    public void onUpdate() {
        updatedAt = ZonedDateTime.now(ZoneOffset.UTC);
    }
}
