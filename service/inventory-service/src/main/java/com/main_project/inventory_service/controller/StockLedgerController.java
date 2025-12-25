package com.main_project.inventory_service.controller;

import com.main_project.inventory_service.entity.StockLedger;
import com.main_project.inventory_service.service.StockLedgerService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/inventory-service/stock-ledgers")
@RequiredArgsConstructor
public class StockLedgerController {

    private final StockLedgerService stockLedgerService;

    @PostMapping
    public StockLedgerDTO create(@RequestBody StockLedgerDTO stockLedger) {
        // Nhận request tạo StockLedger
        // Gọi service để tạo StockLedger
        // Trả về response với StockLedger đã tạo
    }

    @PutMapping
    public StockLedgerDTO update(@RequestBody StockLedgerDTO stockLedger) {
        // Nhận request cập nhật StockLedger
        // Gọi service để cập nhật StockLedger
        // Trả về response với StockLedger đã cập nhật
    }
}



