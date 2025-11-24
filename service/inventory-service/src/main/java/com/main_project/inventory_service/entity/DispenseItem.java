package com.main_project.inventory_service.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Entity
@Table(name = "dispense_item")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class DispenseItem {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    private Integer quantity;

    private Integer priceAtDispense;

    private String dosage;
    private String frequency;
    private String duration;
    private String usageInstructions;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "inventory_lot_id")
    private InventoryLot inventoryLot;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "dispense_order_id")
    private DispenseOrder dispenseOrder;
}



