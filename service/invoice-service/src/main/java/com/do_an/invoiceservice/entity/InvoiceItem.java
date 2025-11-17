package com.do_an.invoiceservice.entity;


import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "invoice_item")
@Getter
@Setter
public class InvoiceItem {
    @Id
    @Column(length = 50, unique = true, nullable = false)
    private String id; // varchar(50)

    private Integer referenceId; // int4 -> Integer
    private String serviceType;
    private Integer quantity;
    private String description;
    private Double unitPrice; // float4 -> Double

    @CreationTimestamp
    private LocalDateTime createAt;
    @UpdateTimestamp
    private LocalDateTime updateAt;

    // Quan hệ Nhiều-1
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "invoice_id", nullable = false)

    private Invoice invoice;
}
