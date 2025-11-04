package com.main_project.inventory_service.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Entity
@Table(name = "DispenseItem")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class DispenseItem {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    private Integer quantity;

    private Integer priceAtDispense;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "inventoryLotId")
    private InventoryLot inventoryLot;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "dispenseOrderId")
    private DispenseOrder dispenseOrder;
}



