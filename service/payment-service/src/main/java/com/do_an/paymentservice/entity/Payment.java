package com.do_an.paymentservice.entity;


import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "payment")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Payment {
    @Id
    @Column(length = 50, unique = true, nullable = false)
    private String id; // UUID của hệ thống

    @Column(nullable = false)
    private Double totalAmount;

    @Column(nullable = false)
    private String invoiceId; // ID của hóa đơn (từ invoice-service)

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private PaymentStatus status;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private PaymentMethod paymentMethod;

    /**
     * ID giao dịch của bên thứ 3.
     * Đối với payOS, đây chính là "orderCode" (dạng int, ta lưu là String)
     * Phải là UNIQUE để tra cứu webhook
     */
    @Column(unique = true)
    private String transactionId;

    private LocalDateTime paidAt;

    @Column(length = 500)
    private String description;

    @Column(columnDefinition = "TEXT")
    private String paymentUrl;

    // Thêm field expiredAt để lưu thời gian hết hạn
    private LocalDateTime expiredAt;

    @CreationTimestamp
    private LocalDateTime createAt;
    @UpdateTimestamp
    private LocalDateTime updateAt;
}