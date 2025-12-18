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
import org.springframework.stereotype.Component;

import java.util.Comparator;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;
import com.main_project.inventory_service.entity.Pharmacist;
import com.main_project.inventory_service.repository.PharmacistRepository;

@Component
@RequiredArgsConstructor
@Slf4j
public class InventoryEventHandler {

    private final MedicineRepository medicineRepository;

    private final InventoryLotRepository inventoryLotRepository;

    private final StockLedgerRepository stockLedgerRepository;

    private final DispenseItemRepository dispenseItemRepository;

    private final DispenseOrderRepository dispenseOrderRepository;

    private final PharmacistRepository pharmacistRepository;

    private final EventBus eventBus;

    @EventHandler
    @Transactional
    public void on(MedicineReservedEvent event) {
        try {
            DispenseOrder dispenseOrder = new DispenseOrder();
            dispenseOrder.setId(event.getDispenseOrderId());
            dispenseOrder.setPrescription(event.getPrescriptionId());
            dispenseOrder.setMedicalHistoryId(event.getMedicalHistoryId());
            dispenseOrder.setDoctorId(event.getDoctorId());
            dispenseOrder.setStatus("RESERVED");
            
            // ✅ Lấy pharmacist từ DispenseOrder nếu có
            Pharmacist pharmacist = null;
            if (dispenseOrder.getPharmacist() != null) {
                pharmacist = dispenseOrder.getPharmacist();
            }
            
            dispenseOrderRepository.save(dispenseOrder);

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

                    DispenseItem dispenseItem = new DispenseItem();
                    dispenseItem.setId(UUID.randomUUID());
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

                    // Ghi stock ledger - Xuất kho tự động từ saga
                    StockLedger ledgerEntry = new StockLedger();
                    ledgerEntry.setType("OUT");
                    ledgerEntry.setQuantity(toReserveFromLot);
                    ledgerEntry.setReferenceId(dispenseItem.getId());
                    ledgerEntry.setReferenceType("AUTO_DISPENSE");
                    ledgerEntry.setInventoryLot(lot);
                    // ✅ Set pharmacist nếu có
                    if (pharmacist != null) {
                        ledgerEntry.setPharmacist(pharmacist);
                    }
                    stockLedgerRepository.save(ledgerEntry);
                    log.debug("✅ [AUTO-EXPORT] Stock ledger: lotNo={}, qty={}, pharmacist={}", 
                            lot.getLotNo(), toReserveFromLot, pharmacist != null ? pharmacist.getUserId() : "N/A");

                    remainingToReserve -= toReserveFromLot;
                }
            }

            log.info("Đã cập nhật kho thành công cho đơn thuốc: {}", event.getPrescriptionId());

        } catch (Exception e) {
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
            List<DispenseOrder> dispenseOrders =
                    dispenseOrderRepository.findAllByPrescription(event.getPrescriptionId());

            // Đánh dấu hủy đơn xuất
            dispenseOrders.forEach(order -> order.setStatus("CANCELLED"));
            dispenseOrderRepository.saveAll(dispenseOrders);

            // Hoàn trả lại số lượng vào lô
            for (DispenseOrder order : dispenseOrders) {
                List<DispenseItem> dispenseItems = dispenseItemRepository.findByDispenseOrderId(order.getId());
                for (DispenseItem dispenseItem : dispenseItems) {
                    rollbackDispenseItem(dispenseItem);
                }
            }
            log.info("Đã rollback kho thành công cho Release");

        } catch (Exception e) {
            log.error("Lỗi khi rollback kho: {}", e.getMessage());
        }
    }


    private void rollbackDispenseItem(DispenseItem dispenseItem) {
        if (dispenseItem == null || dispenseItem.getInventoryLot() == null) {
            return;
        }

        InventoryLot lot = dispenseItem.getInventoryLot();
        Integer quantityToRestore = dispenseItem.getQuantity();

        int currentQuantity = lot.getQuantityOnHand() != null ? lot.getQuantityOnHand() : 0;
        lot.setQuantityOnHand(currentQuantity + quantityToRestore);
        inventoryLotRepository.save(lot);

        // ✅ Lấy pharmacist từ DispenseOrder nếu có
        Pharmacist pharmacist = null;
        if (dispenseItem.getDispenseOrder() != null && 
            dispenseItem.getDispenseOrder().getPharmacist() != null) {
            pharmacist = dispenseItem.getDispenseOrder().getPharmacist();
        }

        // Ghi stock ledger - Hoàn trả kho do rollback
        StockLedger reverseLedgerEntry = new StockLedger();
        reverseLedgerEntry.setId(UUID.randomUUID());
        reverseLedgerEntry.setType("IN");
        reverseLedgerEntry.setQuantity(quantityToRestore);
        reverseLedgerEntry.setReferenceId(dispenseItem.getId());
        reverseLedgerEntry.setReferenceType("AUTO_ROLLBACK");
        reverseLedgerEntry.setInventoryLot(lot);
        // ✅ Set pharmacist nếu có
        if (pharmacist != null) {
            reverseLedgerEntry.setPharmacist(pharmacist);
        }
        stockLedgerRepository.save(reverseLedgerEntry);
        log.debug("✅ [AUTO-ROLLBACK] Stock ledger: lotNo={}, qty={}, pharmacist={}", 
                lot.getLotNo(), quantityToRestore, pharmacist != null ? pharmacist.getUserId() : "N/A");
    }


}
