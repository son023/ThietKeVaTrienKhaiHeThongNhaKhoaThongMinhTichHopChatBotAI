package com.main_project.inventory_service.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.ZonedDateTime;
import java.util.UUID;

@Entity
@Table(name = "dispense_order")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class DispenseOrder {
    @Id
    //@GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "pharmacist_id")
    private Pharmacist pharmacist;

    private UUID prescription;

    @Column(length = 255)
    private String status;

    @Column(name = "medical_history_id", length = 50)
    private UUID medicalHistoryId;

    @Column(name = "doctor_id", length = 50)
    private UUID doctorId;

    @CreationTimestamp
    @Column(name = "create_at", updatable = false)
    private ZonedDateTime createAt;

    @UpdateTimestamp
    @Column(name = "update_at")
    private ZonedDateTime updateAt;
}



