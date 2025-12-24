package com.main_project.inventory_service.repository;

import com.main_project.inventory_service.entity.DispenseOrder;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface DispenseOrderRepository extends JpaRepository<DispenseOrder, UUID> {
    // Find DispenseOrder by prescription ID
    Optional<DispenseOrder> findByPrescription(UUID prescriptionId);
    
    // Find all DispenseOrders by prescription ID
    List<DispenseOrder> findAllByPrescription(UUID prescriptionId);

    // ✅ THÊM: Lấy danh sách theo status
    List<DispenseOrder> findAllByStatusOrderByCreateAtDesc(String status);

    // ✅ THÊM: Lấy danh sách theo nhiều status
    List<DispenseOrder> findAllByStatusInOrderByCreateAtDesc(List<String> statuses);

    Optional<DispenseOrder> findByMedicalHistoryId(UUID medicalHistoryId);

    // Tìm đơn gần nhất theo hồ sơ bệnh án
    Optional<DispenseOrder> findFirstByMedicalHistoryIdOrderByCreateAtDesc(UUID medicalHistoryId);

    // Tìm đơn gần nhất theo hồ sơ bệnh án với danh sách trạng thái
    Optional<DispenseOrder> findFirstByMedicalHistoryIdAndStatusInOrderByCreateAtDesc(UUID medicalHistoryId, List<String> statuses);
}



