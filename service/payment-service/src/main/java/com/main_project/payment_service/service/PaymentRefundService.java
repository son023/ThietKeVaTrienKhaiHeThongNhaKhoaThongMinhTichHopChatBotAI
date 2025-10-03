package com.main_project.payment_service.service;

import com.main_project.payment_service.entity.PaymentRefund;
import com.main_project.payment_service.repository.PaymentRefundRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class PaymentRefundService {
    private final PaymentRefundRepository paymentRefundRepository;

    public PaymentRefundService(PaymentRefundRepository paymentRefundRepository) {
        this.paymentRefundRepository = paymentRefundRepository;
    }

    public PaymentRefund create(PaymentRefund entity) { return paymentRefundRepository.save(entity); }
    public PaymentRefund getById(String id) { return paymentRefundRepository.findById(id).orElse(null); }
    public List<PaymentRefund> getAll() { return paymentRefundRepository.findAll(); }
    public PaymentRefund update(String id, PaymentRefund entity) { entity.setId(id); return paymentRefundRepository.save(entity); }
    public void delete(String id) { paymentRefundRepository.deleteById(id); }
}



