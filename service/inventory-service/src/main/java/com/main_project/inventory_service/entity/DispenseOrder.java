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

    private UUID pharmacistId;


    private UUID prescription;

    @Column(length = 255)
    private String status;

    private UUID medicalHistoryid;
    private UUID doctorId;

    @CreationTimestamp
    @Column(name = "create_at", updatable = false)
    private ZonedDateTime createAt;

    @UpdateTimestamp
    @Column(name = "update_at")
    private ZonedDateTime updateAt;

}



