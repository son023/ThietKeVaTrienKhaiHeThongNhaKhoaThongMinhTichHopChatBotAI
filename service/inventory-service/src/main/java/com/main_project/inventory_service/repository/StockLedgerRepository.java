package com.main_project.inventory_service.repository;

import com.main_project.inventory_service.entity.StockLedger;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface StockLedgerRepository extends JpaRepository<StockLedger, UUID> {
    
    // Lưu StockLedger vào database
    Optional<StockLedger> save(StockLedgerDTO stockLedger);

    // Cập nhật StockLedger vào  database
    Optional<StockLedger> update(StockLedgerDTO stockLedger);

    // Tìm tất cả StockLedger theo ID tham chiếu và loại
    List<StockLedger> findAllByReferenceIdAndType(UUID referenceId, String type);
}



