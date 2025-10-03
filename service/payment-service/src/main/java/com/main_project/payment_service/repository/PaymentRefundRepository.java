package com.main_project.payment_service.repository;

import com.main_project.payment_service.entity.PaymentRefund;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PaymentRefundRepository extends JpaRepository<PaymentRefund, String> {
}



