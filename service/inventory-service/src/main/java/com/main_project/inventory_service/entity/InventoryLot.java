package com.main_project.inventory_service.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.UUID;

@Entity
@Table(name = "inventory_lot")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class InventoryLot {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    @Column(unique = true, nullable = false, length = 100)
    private String lotNo;

    private LocalDate expireDate;

    @Column(columnDefinition = "INT DEFAULT 0")
    private Integer quantityOnHand;

    private Integer costPrice;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "medicine_id")
    private Medicine medicine;
}



