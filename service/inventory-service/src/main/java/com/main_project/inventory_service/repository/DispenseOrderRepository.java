package com.main_project.inventory_service.repository;

import com.main_project.inventory_service.entity.DispenseOrder;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface DispenseOrderRepository extends JpaRepository<DispenseOrder, UUID> {
    // Lưu DispenseOrder vào database
    Optional<DispenseOrder> save(DispenseOrderDTO dispenseOrder);

    // Cập nhật DispenseOrder trong database
    Optional<DispenseOrder> update(DispenseOrderDTO dispenseOrder);

    // Tìm tất cả DispenseOrder theo ID prescription
    List<DispenseOrder> findAllByPrescription(UUID prescriptionId);
}



