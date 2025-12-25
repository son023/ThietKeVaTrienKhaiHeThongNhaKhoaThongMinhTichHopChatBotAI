package com.main_project.inventory_service.repository;

import com.main_project.inventory_service.entity.InventoryLot;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface InventoryLotRepository extends JpaRepository<InventoryLot, UUID> {
    // Lưu lô tồn kho vào database
    Optional<InventoryLot> save(InventoryLotDTO inventoryLot);
    
    // Cập nhật lô tồn kho trong database
    Optional<InventoryLot> update(InventoryLotDTO inventoryLot);
    
    // Tìm tất cả lô tồn kho theo ID thuốc
    List<InventoryLot> findAllByMedicineId(UUID medicineId);
}



