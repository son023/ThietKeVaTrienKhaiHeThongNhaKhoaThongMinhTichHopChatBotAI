package com.main_project.inventory_service.controller;

import com.main_project.inventory_service.entity.InventoryLot;
import com.main_project.inventory_service.service.InventoryLotService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/inventory-service/inventory-lots")
@RequiredArgsConstructor
public class InventoryLotController {
    private final InventoryLotService inventoryLotService;

    @GetMapping("/check-stock/{medicineId}")
    public Boolean checkStock(@PathVariable UUID medicineId) {
        // Nhận request kiểm tra tồn kho theo ID thuốc
        // Gọi service để kiểm tra tồn kho
        // Trả về response với kết quả kiểm tra tồn kho
    }

    @PostMapping
    public InventoryLotDTO create(@RequestBody InventoryLotDTO inventoryLot) {
        // Nhận request tạo lô tồn kho
        // Gọi service để tạo lô tồn kho
        // Trả về response với lô tồn kho đã tạo
    }

    @PutMapping
    public InventoryLotDTO update(@RequestBody InventoryLotDTO inventoryLot) {
        // Nhận request cập nhật lô tồn kho
        // Gọi service để cập nhật lô tồn kho
        // Trả về response với lô tồn kho đã cập nhật
    }
}



