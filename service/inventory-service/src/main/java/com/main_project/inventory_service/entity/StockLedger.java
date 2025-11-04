package com.main_project.inventory_service.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Entity
@Table(name = "stock_ledger")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class StockLedger {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    @Column(length = 255)
    private String lot;

    @Column(length = 255)
    private String type; // 'IN', 'OUT', 'ADJUST'

    private Integer quantity;

    @Column(length = 255)
    private String referenceType;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "inventory_lot_id")
    private InventoryLot inventoryLot;
}



