package com.main_project.payment_service.controller;

import com.main_project.payment_service.entity.Payment;
import com.main_project.payment_service.service.PaymentService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.util.List;

@RestController
@RequestMapping("/api/payments")
public class PaymentController {
    private final PaymentService paymentService;

    public PaymentController(PaymentService paymentService) {
        this.paymentService = paymentService;
    }

    @PostMapping
    public ResponseEntity<Payment> create(@RequestBody Payment body) {
        Payment created = paymentService.create(body);
        return ResponseEntity.created(URI.create("/api/payments/" + created.getId())).body(created);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Payment> get(@PathVariable String id) {
        Payment found = paymentService.getById(id);
        return found == null ? ResponseEntity.notFound().build() : ResponseEntity.ok(found);
    }

    @GetMapping
    public List<Payment> list() { return paymentService.getAll(); }

    @PutMapping("/{id}")
    public ResponseEntity<Payment> update(@PathVariable String id, @RequestBody Payment body) {
        return ResponseEntity.ok(paymentService.update(id, body));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable String id) {
        paymentService.delete(id);
        return ResponseEntity.noContent().build();
    }
}



