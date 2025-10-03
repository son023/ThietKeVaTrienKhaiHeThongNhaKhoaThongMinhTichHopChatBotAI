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
@Table(name = "payment_refund")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class PaymentRefund {

    @Id
    @Column(name = "id", columnDefinition = "CHAR(36)")
    String id;

    @Column(name = "payment_id", columnDefinition = "CHAR(36)")
    String paymentId;

    @Column(name = "amount", precision = 12, scale = 2)
    BigDecimal amount;

    @Column(name = "provider_refund_id", length = 100)
    String providerRefundId;

    @Column(name = "created_at", nullable = false)
    @Builder.Default
    LocalDateTime createdAt = LocalDateTime.now();
}



