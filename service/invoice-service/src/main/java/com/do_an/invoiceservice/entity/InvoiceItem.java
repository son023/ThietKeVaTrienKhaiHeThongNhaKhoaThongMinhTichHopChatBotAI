package com.do_an.invoiceservice.entity;


import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "invoice_item")
@Getter
@Setter
public class InvoiceItem {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id; // varchar(50)

    private Integer referenceId;
    private String serviceType;
    private Integer quantity;
    private String description;
    private Integer unitPrice;

    private Integer insurancePayAmount;
    private Integer patientPayAmount;

    @CreationTimestamp
    private LocalDateTime createAt;
    @UpdateTimestamp
    private LocalDateTime updateAt;

    // Quan hệ Nhiều-1
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "invoice_id", nullable = false)

    private Invoice invoice;
}
