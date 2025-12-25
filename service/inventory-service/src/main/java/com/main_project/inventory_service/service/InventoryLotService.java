package com.main_project.inventory_service.service;

import com.main_project.inventory_service.entity.InventoryLot;
import com.main_project.inventory_service.repository.InventoryLotRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class InventoryLotService {

    private final InventoryLotRepository inventoryLotRepository;

    @Transactional(readOnly = true)
    public boolean checkStock(UUID medicineId) {
        // Tìm tất cả lô tồn kho theo ID thuốc
        // Kiểm tra xem có lô nào còn tồn kho không (quantityOnHand > 0)
        // Nếu có, trả về true
        // Nếu không, trả về false;
    }

    @Transactional
    public InventoryLotDTO create(InventoryLotDTO inventoryLot) {
        // Tạo lô tồn kho mới với thông tin từ request
        // Kiểm tra thông tin lô tồn kho hợp lệ
        // Lưu lô tồn kho vào database
        // Trả về lô tồn kho đã tạo
    }

    @Transactional
    public InventoryLotDTO update(InventoryLotDTO inventoryLot) {
        // Tìm lô tồn kho theo ID
        // Nếu không tìm thấy, ném ra ngoại lệ
        // Cập nhật thông tin lô tồn kho
        // Lưu lô tồn kho đã cập nhật vào database
        // Trả về lô tồn kho đã cập nhật
    }
}

