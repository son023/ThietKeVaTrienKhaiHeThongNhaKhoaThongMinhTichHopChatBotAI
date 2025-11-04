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
@Table(name = "DispenseOrder")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class DispenseOrder {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    private Integer pharmacistId;

    @Column(length = 255)
    private String prescription;

    @Column(length = 255)
    private String status;

    @CreationTimestamp
    @Column(name = "createAt", updatable = false)
    private ZonedDateTime createAt;

    @UpdateTimestamp
    @Column(name = "updateAt")
    private ZonedDateTime updateAt;
}



