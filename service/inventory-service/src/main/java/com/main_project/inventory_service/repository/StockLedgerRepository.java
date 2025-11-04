package com.main_project.inventory_service.repository;

import com.main_project.inventory_service.entity.StockLedger;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface StockLedgerRepository extends JpaRepository<StockLedger, UUID> {
}



