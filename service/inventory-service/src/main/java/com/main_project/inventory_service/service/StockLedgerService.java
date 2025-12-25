package com.main_project.inventory_service.service;

import com.main_project.inventory_service.entity.StockLedger;
import com.main_project.inventory_service.repository.StockLedgerRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class StockLedgerService {

    private final StockLedgerRepository stockLedgerRepository;

    @Transactional
    public StockLedgerDTO create(StockLedgerDTO stockLedger) {
        // Tạo StockLedger mới với thông tin từ request
        // Kiểm tra thông tin StockLedger hợp lệ
        // Lưu StockLedger vào database
        // Trả về StockLedger đã tạo
    }

    @Transactional
    public StockLedgerDTO update(StockLedgerDTO stockLedger) {
        // Tìm StockLedger theo ID
        // Nếu không tìm thấy, ném ra ngoại lệ
        // Cập nhật thông tin StockLedger
        // Lưu StockLedger đã cập nhật vào database
        // Trả về StockLedger đã cập nhật
    }
}

