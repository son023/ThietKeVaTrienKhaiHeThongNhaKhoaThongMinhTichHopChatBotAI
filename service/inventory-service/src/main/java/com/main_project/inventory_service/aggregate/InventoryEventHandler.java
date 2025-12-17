package com.main_project.inventory_service.aggregate;

import com.do_an.common.event.MedicineReservationFailedEvent;
import com.do_an.common.event.MedicineReservationReleasedEvent;
import com.do_an.common.event.MedicineReservedEvent;
import com.do_an.common.model.MedicineItem;
import com.main_project.inventory_service.entity.*;
import com.main_project.inventory_service.repository.*;
import lombok.extern.slf4j.Slf4j;
import org.springframework.transaction.annotation.Transactional;
import lombok.RequiredArgsConstructor;
import org.axonframework.eventhandling.EventBus;
import org.axonframework.eventhandling.EventHandler;
import org.axonframework.eventhandling.GenericEventMessage;
import org.axonframework.modelling.command.AggregateLifecycle;
import org.springframework.stereotype.Component;

import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Component
@RequiredArgsConstructor
@Slf4j
public class InventoryEventHandler {

    private final MedicineRepository medicineRepository;

    private final InventoryLotRepository inventoryLotRepository;

    private final StockLedgerRepository stockLedgerRepository;

    private final DispenseItemRepository dispenseItemRepository;

    private final DispenseOrderRepository dispenseOrderRepository;

    private final EventBus eventBus;

    @EventHandler
    @Transactional
    public void on(MedicineReservedEvent event) {
        try {
            
            log.info("📦 [INVENTORY] Processing MedicineReservedEvent: dispenseOrderId={}, prescriptionId={}", 
                    event.getDispenseOrderId(), event.getPrescriptionId());

            // ✅ IDEMPOTENCY CHECK: Kiểm tra xem DispenseOrder đã tồn tại chưa
            DispenseOrder dispenseOrder = dispenseOrderRepository.findById(event.getDispenseOrderId())
                    .orElse(null);
            
            if (dispenseOrder != null) {
                log.warn("⚠️ DispenseOrder {} already exists with status {}, skipping event processing", 
                        event.getDispenseOrderId(), dispenseOrder.getStatus());
                
                // ✅ Nếu status là RESERVED hoặc SOLD → event đã được xử lý
                if ("RESERVED".equals(dispenseOrder.getStatus()) || "SOLD".equals(dispenseOrder.getStatus())) {
                    return;
                }
            }

            // ✅ Tạo mới nếu chưa tồn tại
            if (dispenseOrder == null) {
                dispenseOrder = new DispenseOrder();
                dispenseOrder.setId(event.getDispenseOrderId());
                dispenseOrder.setPrescription(event.getPrescriptionId());
                dispenseOrder.setMedicalHistoryId(event.getMedicalHistoryId());
                dispenseOrder.setDoctorId(event.getDoctorId());
                dispenseOrder.setStatus("RESERVED");
                dispenseOrder = dispenseOrderRepository.save(dispenseOrder);
                log.info("✅ Created new DispenseOrder: {}", dispenseOrder.getId());
            }

            // ✅ Check xem items đã được tạo chưa
            List<DispenseItem> existingItems = dispenseItemRepository.findByDispenseOrderId(dispenseOrder.getId());
            if (!existingItems.isEmpty()) {
                log.warn("⚠️ DispenseItems already exist for order {}, count={}, skipping item creation", 
                        dispenseOrder.getId(), existingItems.size());
                return;
            }


            for (MedicineItem item : event.getItems()) {
                UUID medicineId = item.getMedicineId();

                Medicine medicine = medicineRepository.findById(medicineId)
                        .orElseThrow(() -> new RuntimeException("Medicine not found: " + item.getMedicineId()));

                List<InventoryLot> availableLots = inventoryLotRepository.findAll().stream()
                        .filter(lot -> lot.getMedicine() != null &&
                                lot.getMedicine().getId().equals(medicineId) &&
                                lot.getQuantityOnHand() != null &&
                                lot.getQuantityOnHand() > 0)
                        .sorted(Comparator.comparing(InventoryLot::getExpireDate, Comparator.nullsLast(Comparator.naturalOrder())))
                        .collect(Collectors.toList());

                int remainingToReserve = item.getQuantity();

                for (InventoryLot lot : availableLots) {
                    if (remainingToReserve <= 0) break;

                    int availableInLot = lot.getQuantityOnHand() != null ? lot.getQuantityOnHand() : 0;
                    int toReserveFromLot = Math.min(remainingToReserve, availableInLot);

                    // ✅ Tạo deterministic ID cho DispenseItem
                    UUID dispenseItemId = generateDeterministicUUID(
                            dispenseOrder.getId().toString(), 
                            medicineId.toString(), 
                            lot.getId().toString()
                    );  

                    // ✅ Check xem item này đã tồn tại chưa
                    if (dispenseItemRepository.existsById(dispenseItemId)) {
                        log.warn("⚠️ DispenseItem {} already exists, skipping...", dispenseItemId);
                        continue;
                    }


                    DispenseItem dispenseItem = new DispenseItem();
                    dispenseItem.setId(dispenseItemId);
                    dispenseItem.setQuantity(toReserveFromLot);
                    dispenseItem.setPriceAtDispense(medicine.getSalePrice() != null ? medicine.getSalePrice() : 0);
                    dispenseItem.setInventoryLot(lot);
                    dispenseItem.setDosage(item.getDosage());
                    dispenseItem.setDuration(item.getDuration());
                    dispenseItem.setFrequency(item.getFrequency());
                    dispenseItem.setUsageInstructions(item.getInstruction());
                    dispenseItem.setDispenseOrder(dispenseOrder);
                    dispenseItem = dispenseItemRepository.save(dispenseItem);

                    lot.setQuantityOnHand(availableInLot - toReserveFromLot);
                    inventoryLotRepository.save(lot);
                    
                    // ✅ Tạo StockLedger với deterministic ID
                    UUID ledgerId = generateDeterministicUUID(dispenseItemId.toString(), "LEDGER", "OUT");
            
                    if (!stockLedgerRepository.existsById(ledgerId)) {
                    StockLedger ledgerEntry = new StockLedger();
                    ledgerEntry.setId(ledgerId);
                    ledgerEntry.setType("OUT");
                    ledgerEntry.setQuantity(toReserveFromLot);
                    ledgerEntry.setReferenceId(dispenseItem.getId());
                    ledgerEntry.setReferenceType("DISPENSE_ITEM");
                    ledgerEntry.setInventoryLot(lot);
                    stockLedgerRepository.save(ledgerEntry);
                    }

                    remainingToReserve -= toReserveFromLot;
                }
                 if (remainingToReserve > 0) {
                     throw new RuntimeException("Không đủ tồn kho cho thuốc: " + medicine.getName());
                }
            }

            log.info("Đã cập nhật kho thành công cho đơn thuốc: {}", event.getPrescriptionId());

        } catch (Exception e) {
            //try-catch để báo Saga rollback nếu việc GHI DB thất bại
            log.error("Lỗi khi cập nhật DB Inventory: {}", e.getMessage());
            eventBus.publish(GenericEventMessage.asEventMessage(
                    new MedicineReservationFailedEvent(event.getPrescriptionId())
            ));

            throw new RuntimeException("Hoàn tác giao dịch kho", e);
        }

    }



    @EventHandler
    @Transactional
    public void on(MedicineReservationReleasedEvent event){
            try {
            log.info("🔄 [ROLLBACK] Processing MedicineReservationReleasedEvent: prescriptionId={}", 
                    event.getPrescriptionId());

            List<DispenseOrder> dispenseOrders =
                    dispenseOrderRepository.findAllByPrescription(event.getPrescriptionId());

            for (DispenseOrder order : dispenseOrders) {
                // ✅ Idempotency: Chỉ rollback nếu chưa CANCELLED
                if (!"CANCELLED".equals(order.getStatus())) {
                    order.setStatus("CANCELLED");
                    dispenseOrderRepository.save(order);

                    List<DispenseItem> dispenseItems = dispenseItemRepository.findByDispenseOrderId(order.getId());
                    for (DispenseItem dispenseItem : dispenseItems) {
                        rollbackDispenseItem(dispenseItem);
                    }
                } else {
                    log.warn("⚠️ DispenseOrder {} already CANCELLED, skipping rollback", order.getId());
                }
            }

            log.info("✅ Đã rollback kho thành công");

        } catch (Exception e) {
            log.error("❌ Lỗi khi rollback kho: {}", e.getMessage(), e);
        }
    }


    private void rollbackDispenseItem(DispenseItem dispenseItem) {
        if (dispenseItem == null || dispenseItem.getInventoryLot() == null) {
            return;
        }

        InventoryLot lot = dispenseItem.getInventoryLot();
        Integer quantityToRestore = dispenseItem.getQuantity();

        // ✅ Check xem đã rollback chưa bằng cách kiểm tra StockLedger
        UUID rollbackLedgerId = generateDeterministicUUID(
                dispenseItem.getId().toString(), 
                "LEDGER", 
                "ROLLBACK"
        );
        
        if (stockLedgerRepository.existsById(rollbackLedgerId)) {
            log.warn("⚠️ Rollback ledger {} already exists, skipping...", rollbackLedgerId);
            return;
        }

        int currentQuantity = lot.getQuantityOnHand() != null ? lot.getQuantityOnHand() : 0;
        lot.setQuantityOnHand(currentQuantity + quantityToRestore);
        inventoryLotRepository.save(lot);

        StockLedger reverseLedgerEntry = new StockLedger();
        reverseLedgerEntry.setId(rollbackLedgerId);
        reverseLedgerEntry.setType("IN");
        reverseLedgerEntry.setQuantity(quantityToRestore);
        reverseLedgerEntry.setReferenceId(dispenseItem.getId());
        reverseLedgerEntry.setReferenceType("DISPENSE_ITEM_ROLLBACK");
        reverseLedgerEntry.setInventoryLot(lot);
        stockLedgerRepository.save(reverseLedgerEntry);
    }

    // ✅ HELPER: Tạo deterministic UUID
    private UUID generateDeterministicUUID(String... parts) {
        try {
            String combined = String.join("-", parts);
            return UUID.nameUUIDFromBytes(combined.getBytes(StandardCharsets.UTF_8));
        } catch (Exception e) {
            log.error("Error generating deterministic UUID, fallback to random", e);
            return UUID.randomUUID();
        }
    }


}
