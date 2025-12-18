package com.main_project.inventory_service.repository;

import com.main_project.inventory_service.entity.StockLedger;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface StockLedgerRepository extends JpaRepository<StockLedger, UUID> {
    // Find all StockLedger entries by referenceId (DispenseItem.id)
    List<StockLedger> findByReferenceId(UUID referenceId);
    
    // Find all StockLedger entries by referenceId and type
    List<StockLedger> findByReferenceIdAndType(UUID referenceId, String type);
    
    // Find all StockLedger entries by referenceType
    List<StockLedger> findByReferenceType(String referenceType);

    List<StockLedger> findByInventoryLotId(UUID inventoryLotId);
}



