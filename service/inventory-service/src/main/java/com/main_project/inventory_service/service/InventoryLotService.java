package com.main_project.inventory_service.service;

import com.main_project.inventory_service.dto.*;
import com.main_project.inventory_service.entity.InventoryLot;
import com.main_project.inventory_service.entity.Medicine;
import com.main_project.inventory_service.entity.StockLedger;
import com.main_project.inventory_service.entity.DispenseItem;
import com.main_project.inventory_service.entity.DispenseOrder;
import com.main_project.inventory_service.entity.Pharmacist;
import com.main_project.inventory_service.iservice.IInventoryLotService;
import com.main_project.inventory_service.repository.InventoryLotRepository;
import com.main_project.inventory_service.repository.MedicineRepository;
import com.main_project.inventory_service.repository.StockLedgerRepository;
import com.main_project.inventory_service.repository.DispenseItemRepository;
import com.main_project.inventory_service.repository.PharmacistRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class InventoryLotService implements IInventoryLotService {

    private final InventoryLotRepository inventoryLotRepository;
    private final MedicineRepository medicineRepository;
    private final StockLedgerRepository stockLedgerRepository;
    private final DispenseItemRepository dispenseItemRepository;
    private final PharmacistRepository pharmacistRepository;

    @Override
    @Transactional
    public InventoryLotResponse create(InventoryLotRequest request) {
        Medicine medicine = medicineRepository.findById(request.getMedicineId())
                .orElseThrow(() -> new RuntimeException("Medicine not found with id: " + request.getMedicineId()));
        
        Pharmacist pharmacist = pharmacistRepository.findById(request.getPharmacistId())
                .orElseThrow(() -> new RuntimeException("Pharmacist not found with id: " + request.getPharmacistId()));

        InventoryLot inventoryLot = new InventoryLot();
        inventoryLot.setLotNo(request.getLotNo());
        inventoryLot.setExpireDate(request.getExpireDate());
        inventoryLot.setQuantityOnHand(request.getQuantityOnHand() != null ? request.getQuantityOnHand() : 0);
        inventoryLot.setCostPrice(request.getCostPrice());
        inventoryLot.setMedicine(medicine);


        InventoryLot saved = inventoryLotRepository.save(inventoryLot);
        
        // Ghi stock ledger - Nhập kho thủ công
        if (request.getQuantityOnHand() != null && request.getQuantityOnHand() > 0) {
            createStockLedgerEntry(
                saved, 
                pharmacist,
                "IN", 
                request.getQuantityOnHand(), 
                "MANUAL_IMPORT", 
                saved.getId()
            );
            log.info("✅ [IMPORT] Created stock ledger: lotNo={}, quantity={}, pharmacist={}", 
                    saved.getLotNo(), request.getQuantityOnHand(), pharmacist.getUserId());
        }

        return mapToResponse(saved);
    }

    @Override
    @Transactional
    public InventoryLotResponse update(UUID id, InventoryLotRequest request) {
        InventoryLot inventoryLot = inventoryLotRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("InventoryLot not found with id: " + id));

        Medicine medicine = medicineRepository.findById(request.getMedicineId())
                .orElseThrow(() -> new RuntimeException("Medicine not found with id: " + request.getMedicineId()));
        
        Pharmacist pharmacist = pharmacistRepository.findById(request.getPharmacistId())
                .orElseThrow(() -> new RuntimeException("Pharmacist not found with id: " + request.getPharmacistId()));

        // Calculate quantity change
        Integer oldQuantity = inventoryLot.getQuantityOnHand() != null ? inventoryLot.getQuantityOnHand() : 0;
        Integer newQuantity = request.getQuantityOnHand() != null ? request.getQuantityOnHand() : 0;
        Integer quantityChange = newQuantity - oldQuantity;

        inventoryLot.setLotNo(request.getLotNo());
        inventoryLot.setExpireDate(request.getExpireDate());
        inventoryLot.setQuantityOnHand(newQuantity);
        inventoryLot.setCostPrice(request.getCostPrice());
        inventoryLot.setMedicine(medicine);

        InventoryLot updated = inventoryLotRepository.save(inventoryLot);
        
        // Ghi stock ledger - Điều chỉnh số lượng
        if (quantityChange != 0) {
            String referenceType = quantityChange > 0 ? "MANUAL_ADJUST_IN" : "MANUAL_ADJUST_OUT";
            createStockLedgerEntry(
                updated, 
                pharmacist,
                "ADJUST", 
                Math.abs(quantityChange), 
                referenceType, 
                updated.getId()
            );
            log.info("✅ [ADJUST] Stock ledger created: lotNo={}, change={}, pharmacist={}", 
                    updated.getLotNo(), quantityChange, pharmacist.getUserId());
        }

        return mapToResponse(updated);
    }

    @Override
    @Transactional(readOnly = true)
    public InventoryLotResponse getById(UUID id) {
        InventoryLot inventoryLot = inventoryLotRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("InventoryLot not found with id: " + id));
        return mapToResponse(inventoryLot);
    }

    @Override
    @Transactional(readOnly = true)
    public List<InventoryLotResponse> getAll() {
        return inventoryLotRepository.findAll().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public void delete(UUID id) {
        if (!inventoryLotRepository.existsById(id)) {
            throw new RuntimeException("InventoryLot not found with id: " + id);
        }
        inventoryLotRepository.deleteById(id);
    }

    // ==================== MANUAL EXPORT (XUẤT KHO THỦ CÔNG) ====================

    @Override
    @Transactional
    public ManualExportResponse exportStock(ManualExportRequest request) {
        // 1. Validate inventory lot exists
        InventoryLot inventoryLot = inventoryLotRepository.findById(request.getInventoryLotId())
                .orElseThrow(() -> new RuntimeException("InventoryLot not found with id: " + request.getInventoryLotId()));

        // 2. Validate pharmacist exists
        Pharmacist pharmacist = pharmacistRepository.findById(request.getPharmacistId())
                .orElseThrow(() -> new RuntimeException("Pharmacist not found with id: " + request.getPharmacistId()));

        // 3. Validate quantity
        Integer currentQuantity = inventoryLot.getQuantityOnHand() != null ? inventoryLot.getQuantityOnHand() : 0;
        if (currentQuantity < request.getQuantity()) {
            throw new RuntimeException(String.format(
                "Không đủ tồn kho. Hiện có: %d, Yêu cầu: %d", 
                currentQuantity, 
                request.getQuantity()
            ));
        }

        // 4. Update inventory lot quantity
        inventoryLot.setQuantityOnHand(currentQuantity - request.getQuantity());
        inventoryLotRepository.save(inventoryLot);

        // 5. Create stock ledger entry
        String referenceType = getReferenceTypeFromReason(request.getReason());
        StockLedger stockLedger = createStockLedgerEntry(
            inventoryLot, 
            pharmacist,
            "OUT", 
            request.getQuantity(), 
            referenceType, 
            inventoryLot.getId()
        );

        log.info("✅ [EXPORT] Manual export completed: lotNo={}, quantity={}, reason={}, pharmacist={}", 
                inventoryLot.getLotNo(), request.getQuantity(), request.getReason(), pharmacist.getUserId());

        // 6. Return response
        return new ManualExportResponse(
                stockLedger.getId(),
                inventoryLot.getId(),
                inventoryLot.getLotNo(),
                inventoryLot.getMedicine() != null ? inventoryLot.getMedicine().getName() : null,
                request.getQuantity(),
                request.getReason(),
                request.getNotes(),
                stockLedger.getCreateAt(),
                pharmacist.getUserId().toString(), // ✅ pharmacistId
                null, // prescriptionId (manual export has no prescription)
                null, // dispenseOrderId (manual export has no dispense order)
                "MANUAL" // exportType
        );
    }

    @Override
    @Transactional(readOnly = true)
    public List<ManualExportResponse> getAllManualExports() {
        // Get all OUT type stock ledgers that are manual exports
        List<StockLedger> manualExports = stockLedgerRepository.findAll().stream()
                .filter(sl -> "OUT".equals(sl.getType()))
                .filter(sl -> sl.getReferenceType() != null && 
                            sl.getReferenceType().startsWith("MANUAL_EXPORT_"))
                .collect(Collectors.toList());

        return manualExports.stream()
                .map(this::mapStockLedgerToExportResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<ManualExportResponse> getAllExports() {
        // Get ALL OUT type stock ledgers (both manual and auto)
        List<StockLedger> allExports = stockLedgerRepository.findAll().stream()
                .filter(sl -> "OUT".equals(sl.getType()))
                .filter(this::shouldIncludeInExportHistory) // Filter out cancelled dispense orders
                .sorted((a, b) -> b.getCreateAt().compareTo(a.getCreateAt())) // Newest first
                .collect(Collectors.toList());

        return allExports.stream()
                .map(this::mapStockLedgerToExportResponse)
                .collect(Collectors.toList());
    }
    
    /**
     * Kiểm tra xem StockLedger có nên hiển thị trong lịch sử xuất kho không
     * - Xuất kho thủ công (MANUAL_EXPORT_*): luôn hiển thị
     * - Xuất kho tự động (AUTO_DISPENSE): chỉ hiển thị nếu DispenseOrder.status != "CANCELLED"
     */
    private boolean shouldIncludeInExportHistory(StockLedger stockLedger) {
        // Nếu là xuất kho thủ công, luôn hiển thị
        if (stockLedger.getReferenceType() != null && 
            stockLedger.getReferenceType().startsWith("MANUAL_EXPORT_")) {
            return true;
        }
        
        // Nếu là xuất kho tự động (AUTO_DISPENSE)
        if ("AUTO_DISPENSE".equals(stockLedger.getReferenceType())) {
            UUID dispenseItemId = stockLedger.getReferenceId();
            if (dispenseItemId != null) {
                try {
                    return dispenseItemRepository.findById(dispenseItemId)
                            .map(dispenseItem -> {
                                DispenseOrder order = dispenseItem.getDispenseOrder();
                                // Chỉ hiển thị nếu DispenseOrder không bị CANCELLED
                                return order != null && !"CANCELLED".equals(order.getStatus());
                            })
                            .orElse(false);
                } catch (Exception e) {
                    log.warn("Failed to check DispenseOrder status for StockLedger {}: {}", 
                            stockLedger.getId(), e.getMessage());
                    return false;
                }
            }
        }
        
        // Các loại khác (nếu có), mặc định hiển thị
        return true;
    }

    @Override
    @Transactional(readOnly = true)
    public List<StockLedgerResponse> getStockLedgersByLotId(UUID lotId) {
        return stockLedgerRepository.findByInventoryLotId(lotId)
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    // ==================== PRIVATE HELPER METHODS ====================



    private StockLedgerResponse mapToResponse(StockLedger stockLedger) {
        return new StockLedgerResponse(
                stockLedger.getId(),
                stockLedger.getType(),
                stockLedger.getQuantity(),
                stockLedger.getReferenceType(),
                stockLedger.getReferenceId(),
                stockLedger.getInventoryLot() != null
                        ? stockLedger.getInventoryLot().getId()
                        : null,
                stockLedger.getPharmacist() != null
                        ? stockLedger.getPharmacist().getUserId()
                        : null // ✅ Thêm pharmacistId
        );
    }

    /**
     * Tạo stock ledger entry
     */
    private StockLedger createStockLedgerEntry(
            InventoryLot inventoryLot, 
            Pharmacist pharmacist,
            String type, 
            Integer quantity, 
            String referenceType, 
            UUID referenceId) {
        
        StockLedger stockLedger = new StockLedger();
        stockLedger.setType(type);
        stockLedger.setQuantity(quantity);
        stockLedger.setReferenceType(referenceType);
        stockLedger.setReferenceId(referenceId);
        stockLedger.setInventoryLot(inventoryLot);
        stockLedger.setPharmacist(pharmacist); // ✅ Set dược sĩ thực hiện giao dịch
        
        return stockLedgerRepository.save(stockLedger);
    }

    /**
     * Map reason to reference type
     */
    private String getReferenceTypeFromReason(String reason) {
        if (reason == null) return "MANUAL_EXPORT_OTHER";
        
        switch (reason) {
            case "Hết hạn sử dụng":
                return "MANUAL_EXPORT_EXPIRED";
            case "Hư hỏng":
                return "MANUAL_EXPORT_DAMAGED";
            case "Chuyển kho":
                return "MANUAL_EXPORT_TRANSFER";
            case "Mất mát":
                return "MANUAL_EXPORT_LOST";
            default:
                return "MANUAL_EXPORT_OTHER";
        }
    }

    /**
     * Parse reason from reference type
     */
    private String parseReasonFromReferenceType(String referenceType) {
        if (referenceType == null) return "Khác";
        
        if (referenceType.contains("EXPIRED")) return "Hết hạn sử dụng";
        if (referenceType.contains("DAMAGED")) return "Hư hỏng";
        if (referenceType.contains("TRANSFER")) return "Chuyển kho";
        if (referenceType.contains("LOST")) return "Mất mát";
        if (referenceType.contains("DISPENSE")) return "Cấp phát tự động (Saga)";
        
        return "Khác";
    }

    /**
     * Map InventoryLot to Response DTO
     * Lấy pharmacistId từ StockLedger đầu tiên (IN type) của lot này
     */
    private InventoryLotResponse mapToResponse(InventoryLot inventoryLot) {
        Medicine medicine = inventoryLot.getMedicine();
        
        // ✅ Lấy pharmacistId từ StockLedger đầu tiên (IN type) - người nhập kho
        UUID pharmacistId = null;
        List<StockLedger> importLedgers = stockLedgerRepository.findAll().stream()
                .filter(sl -> sl.getInventoryLot() != null && 
                             sl.getInventoryLot().getId().equals(inventoryLot.getId()) &&
                             "IN".equals(sl.getType()) &&
                             ("MANUAL_IMPORT".equals(sl.getReferenceType()) || 
                              "MANUAL_ADJUST_IN".equals(sl.getReferenceType())))
                .sorted((a, b) -> a.getCreateAt().compareTo(b.getCreateAt())) // Lấy entry đầu tiên (nhập kho đầu tiên)
                .collect(Collectors.toList());
        
        if (!importLedgers.isEmpty() && importLedgers.get(0).getPharmacist() != null) {
            pharmacistId = importLedgers.get(0).getPharmacist().getUserId();
        }
        
        return new InventoryLotResponse(
                inventoryLot.getId(),
                inventoryLot.getLotNo(),
                inventoryLot.getExpireDate(),
                inventoryLot.getQuantityOnHand(),
                inventoryLot.getCostPrice(),
                medicine != null ? medicine.getId() : null,
                medicine != null ? medicine.getName() : null,
                pharmacistId // ✅ Lấy từ StockLedger
        );
    }

    /**
     * Map StockLedger to ManualExportResponse
     */
    private ManualExportResponse mapStockLedgerToExportResponse(StockLedger stockLedger) {
        InventoryLot lot = stockLedger.getInventoryLot();
        
        // Use arrays to work around "effectively final" requirement in lambda
        final String[] pharmacistName = {null};
        final UUID[] prescriptionId = {null};
        final UUID[] dispenseOrderId = {null};
        String exportType = "MANUAL";
        
        // ✅ Lấy thông tin dược sĩ từ StockLedger (cho cả manual và auto)
        if (stockLedger.getPharmacist() != null) {
            pharmacistName[0] = stockLedger.getPharmacist().getUserId().toString();
        }
        
        // Nếu là xuất kho tự động (AUTO_DISPENSE)
        if ("AUTO_DISPENSE".equals(stockLedger.getReferenceType())) {
            exportType = "AUTO";
            
            // referenceId là DispenseItem.id
            UUID dispenseItemId = stockLedger.getReferenceId();
            if (dispenseItemId != null) {
                try {
                    dispenseItemRepository.findById(dispenseItemId).ifPresent(dispenseItem -> {
                        DispenseOrder order = dispenseItem.getDispenseOrder();
                        if (order != null) {
                            // Lấy thông tin dược sĩ từ DispenseOrder (nếu StockLedger chưa có)
                            if (pharmacistName[0] == null && order.getPharmacist() != null) {
                                UUID pharmacistId = order.getPharmacist().getUserId();
                                pharmacistName[0] = pharmacistId != null ? pharmacistId.toString() : null;
                            }
                            // Lấy prescription ID từ DispenseOrder
                            prescriptionId[0] = order.getPrescription();
                            dispenseOrderId[0] = order.getId();
                        }
                    });
                } catch (Exception e) {
                    log.warn("Failed to fetch DispenseItem for StockLedger {}: {}", 
                            stockLedger.getId(), e.getMessage());
                }
            }
        }
        
        return new ManualExportResponse(
                stockLedger.getId(),
                lot != null ? lot.getId() : null,
                lot != null ? lot.getLotNo() : null,
                lot != null && lot.getMedicine() != null ? lot.getMedicine().getName() : null,
                stockLedger.getQuantity(),
                parseReasonFromReferenceType(stockLedger.getReferenceType()),
                null,
                stockLedger.getCreateAt(),
                pharmacistName[0],
                prescriptionId[0],
                dispenseOrderId[0],
                exportType
        );
    }
}

