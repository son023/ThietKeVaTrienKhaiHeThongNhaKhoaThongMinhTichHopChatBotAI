package com.main_project.payment_service.controller;

import com.main_project.payment_service.entity.PaymentRefund;
import com.main_project.payment_service.service.PaymentRefundService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.util.List;

@RestController
@RequestMapping("/api/payment-refunds")
public class PaymentRefundController {
    private final PaymentRefundService paymentRefundService;

    public PaymentRefundController(PaymentRefundService paymentRefundService) {
        this.paymentRefundService = paymentRefundService;
    }

    @PostMapping
    public ResponseEntity<PaymentRefund> create(@RequestBody PaymentRefund body) {
        PaymentRefund created = paymentRefundService.create(body);
        return ResponseEntity.created(URI.create("/api/payment-refunds/" + created.getId())).body(created);
    }

    @GetMapping("/{id}")
    public ResponseEntity<PaymentRefund> get(@PathVariable String id) {
        PaymentRefund found = paymentRefundService.getById(id);
        return found == null ? ResponseEntity.notFound().build() : ResponseEntity.ok(found);
    }

    @GetMapping
    public List<PaymentRefund> list() { return paymentRefundService.getAll(); }

    @PutMapping("/{id}")
    public ResponseEntity<PaymentRefund> update(@PathVariable String id, @RequestBody PaymentRefund body) {
        return ResponseEntity.ok(paymentRefundService.update(id, body));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable String id) {
        paymentRefundService.delete(id);
        return ResponseEntity.noContent().build();
    }
}



