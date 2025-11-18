package com.do_an.invoiceservice.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "invoice")
@Getter
@Setter
public class Invoice {

    @Id
    @Column(length = 50, unique = true, nullable = false)
    private String id; // varchar(50)

    private String receptionistId;
    private String appointmentId;
    private Double totalAmount; // float4 -> Double
    private String currency;
    private String status; // Ví dụ: ISSUED, PAID, CANCELLED
    private LocalDateTime issueAt;
    private LocalDateTime paidAt;

    @CreationTimestamp
    private LocalDateTime createAt;
    @UpdateTimestamp
    private LocalDateTime updateAt;

    // Quan hệ 1-Nhiều
    // CascadeType.ALL: Khi lưu/xóa Invoice, các Item con cũng được lưu/xóa
    // orphanRemoval = true: Khi xóa một Item khỏi Set này, nó sẽ bị xóa khỏi DB
    @OneToMany(mappedBy = "invoice", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    private Set<InvoiceItem> items = new HashSet<>();

    // Hàm helper để đồng bộ hóa hai chiều
    public void addItem(InvoiceItem item) {
        items.add(item);
        item.setInvoice(this);
    }
}