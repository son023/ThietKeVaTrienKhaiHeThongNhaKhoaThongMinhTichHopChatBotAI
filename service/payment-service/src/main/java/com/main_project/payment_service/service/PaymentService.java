package com.main_project.payment_service.service;

import com.main_project.payment_service.entity.Payment;
import com.main_project.payment_service.repository.PaymentRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class PaymentService {
    private final PaymentRepository paymentRepository;

    public PaymentService(PaymentRepository paymentRepository) {
        this.paymentRepository = paymentRepository;
    }

    public Payment create(Payment entity) { return paymentRepository.save(entity); }
    public Payment getById(String id) { return paymentRepository.findById(id).orElse(null); }
    public List<Payment> getAll() { return paymentRepository.findAll(); }
    public Payment update(String id, Payment entity) { entity.setId(id); return paymentRepository.save(entity); }
    public void delete(String id) { paymentRepository.deleteById(id); }
}



