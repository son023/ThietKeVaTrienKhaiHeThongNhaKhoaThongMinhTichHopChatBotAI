package com.main_project.payment_service.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "payment")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class Payment {

    @Id
    @Column(name = "id", columnDefinition = "CHAR(36)")
    String id;

    @Column(name = "invoice_id", columnDefinition = "CHAR(36)")
    String invoiceId;

    @Column(name = "patient_id", columnDefinition = "CHAR(36)")
    String patientId;

    @Column(name = "amount", precision = 12, scale = 2)
    BigDecimal amount;

    @Column(name = "currency", length = 3)
    String currency;

    @Column(name = "status", length = 20)
    String status;

    @Column(name = "payment_method", length = 50)
    String paymentMethod;

    @Column(name = "provider", length = 50)
    String provider;

    @Column(name = "provider_txn_id", length = 100)
    String providerTxnId;

    @Column(name = "issued_at")
    LocalDateTime issuedAt;

    @Column(name = "paid_at")
    LocalDateTime paidAt;

    @Column(name = "created_at", nullable = false)
    @Builder.Default
    LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "updated_at", nullable = false)
    @Builder.Default
    LocalDateTime updatedAt = LocalDateTime.now();
}



