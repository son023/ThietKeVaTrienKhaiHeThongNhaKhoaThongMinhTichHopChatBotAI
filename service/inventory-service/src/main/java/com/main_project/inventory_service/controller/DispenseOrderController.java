package com.main_project.inventory_service.controller;

import com.main_project.inventory_service.entity.DispenseOrder;
import com.main_project.inventory_service.service.DispenseOrderService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/inventory-service/dispense-orders")
@RequiredArgsConstructor
public class DispenseOrderController {

    private final DispenseOrderService dispenseOrderService;

    @PostMapping
    public DispenseOrderDTO create(@RequestBody DispenseOrderDTO dispenseOrder) {
        // Nhận request tạo DispenseOrder
        // Gọi service để tạo DispenseOrder
        // Trả về response với DispenseOrder đã tạo
    }

    @PutMapping
    public DispenseOrderDTO update(@RequestBody DispenseOrderDTO dispenseOrder) {
        // Nhận request cập nhật DispenseOrder
        // Gọi service để cập nhật DispenseOrder
        // Trả về response với DispenseOrder đã cập nhật
    }

    @GetMapping("/prescription/{prescriptionId}")
    public List<DispenseOrderDTO> getAllPresciption(@PathVariable UUID prescriptionId) {
        // Nhận request lấy danh sách DispenseOrder theo ID prescription
        // Gọi service để lấy danh sách DispenseOrder
        // Trả về response với danh sách DispenseOrder
    }
}



