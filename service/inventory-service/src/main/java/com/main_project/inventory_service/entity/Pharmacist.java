package com.main_project.inventory_service.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "pharmacist")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Pharmacist {
    @Id
    @Column(name = "user_id")
    private UUID userId;

    @Column(length = 255)
    private String degree;

    @Column(length = 255)
    private String certificate;

    
    //Mối quan hệ 1 Pharmacist có nhiều StockLedger (lịch sử giao dịch kho)
    @OneToMany(mappedBy = "pharmacist", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<StockLedger> stockLedgers = new ArrayList<>();
}
