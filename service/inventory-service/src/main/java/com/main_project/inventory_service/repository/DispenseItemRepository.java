package com.main_project.inventory_service.repository;

import com.main_project.inventory_service.entity.DispenseItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface DispenseItemRepository extends JpaRepository<DispenseItem, UUID> {
    // Find all DispenseItems by DispenseOrder
    List<DispenseItem> findByDispenseOrderId(UUID dispenseOrderId);
}



