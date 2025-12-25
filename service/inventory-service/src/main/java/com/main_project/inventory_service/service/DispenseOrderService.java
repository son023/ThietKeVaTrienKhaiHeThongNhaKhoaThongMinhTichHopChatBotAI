package com.main_project.inventory_service.service;

import com.main_project.inventory_service.entity.DispenseOrder;
import com.main_project.inventory_service.repository.DispenseOrderRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class DispenseOrderService {

    private final DispenseOrderRepository dispenseOrderRepository;

    @Transactional
    public DispenseOrderDTO create(DispenseOrderDTO dispenseOrder) {
        // Tạo DispenseOrder mới với thông tin từ request
        // Kiểm tra thông tin DispenseOrder hợp lệ
        // Lưu DispenseOrder vào database
        // Trả về DispenseOrder đã tạo
    }

    @Transactional
    public DispenseOrderDTO update(DispenseOrderDTO dispenseOrder) {
        // Tìm DispenseOrder theo ID
        // Nếu không tìm thấy, ném ra ngoại lệ
        // Cập nhật thông tin DispenseOrder
        // Lưu DispenseOrder đã cập nhật vào database
        // Trả về DispenseOrder đã cập nhật
    }

    @Transactional(readOnly = true)
    public List<DispenseOrderDTO> getAllPresciption(UUID prescriptionId) {
        // Tìm tất cả DispenseOrder theo ID prescription
        // Trả về danh sách DispenseOrder
    }
}



