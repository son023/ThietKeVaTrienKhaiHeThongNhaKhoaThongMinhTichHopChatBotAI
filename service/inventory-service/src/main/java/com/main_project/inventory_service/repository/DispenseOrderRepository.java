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
}



