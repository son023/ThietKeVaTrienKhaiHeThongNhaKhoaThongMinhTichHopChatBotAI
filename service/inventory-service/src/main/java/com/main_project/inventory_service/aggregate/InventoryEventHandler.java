package com.main_project.inventory_service.aggregate;

import com.do_an.common.event.MedicineReservationFailedEvent;
import com.do_an.common.event.MedicineReservationReleasedEvent;
import com.do_an.common.event.MedicineReservedEvent;
import com.do_an.common.model.MedicineItem;
import com.main_project.inventory_service.entity.*;
import com.main_project.inventory_service.repository.*;
import org.springframework.transaction.annotation.Transactional;
import lombok.RequiredArgsConstructor;
import org.axonframework.eventhandling.EventBus;
import org.axonframework.eventhandling.EventHandler;
import org.axonframework.eventhandling.GenericEventMessage;
import org.axonframework.modelling.command.AggregateLifecycle;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Component
@RequiredArgsConstructor
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
            DispenseOrder dispenseOrder = new DispenseOrder();
            dispenseOrder.setId(event.getDispenseOrderId());
            dispenseOrder.setPrescription(event.getPrescriptionId());
            dispenseOrder.setStatus("RESERVED");
            dispenseOrderRepository.save(dispenseOrder);

            // Validate and reserve each medicine
            for (MedicineItem item : event.getItems()) {
                UUID medicineId = item.getMedicineId();

                // Find medicine
                Medicine medicine = medicineRepository.findById(medicineId)
                        .orElseThrow(() -> new RuntimeException("Medicine not found: " + item.getMedicineId()));

                // Find available inventory lots for this medicine
                List<InventoryLot> availableLots = inventoryLotRepository.findAll().stream()
                        .filter(lot -> lot.getMedicine() != null &&
                                lot.getMedicine().getId().equals(medicineId) &&
                                lot.getQuantityOnHand() != null &&
                                lot.getQuantityOnHand() > 0)
                        .sorted(Comparator.comparing(InventoryLot::getExpireDate, Comparator.nullsLast(Comparator.naturalOrder())))
                        .collect(Collectors.toList());

                // Calculate total available quantity
                int totalAvailable = availableLots.stream()
                        .mapToInt(lot -> lot.getQuantityOnHand() != null ? lot.getQuantityOnHand() : 0)
                        .sum();

                // Check if enough stock available
                if (totalAvailable < item.getQuantity()) {
                    throw new RuntimeException("Rollback any partial reservations" + item.getName());

                }

                // Reserve medicine from lots (FIFO - First In First Out)
                int remainingToReserve = item.getQuantity();

                List<DispenseItem> dispenseItemTmp = new ArrayList<>();
                List<StockLedger> stockLedgerTmp = new ArrayList<>();

                for (InventoryLot lot : availableLots) {
                    if (remainingToReserve <= 0) break;

                    int availableInLot = lot.getQuantityOnHand() != null ? lot.getQuantityOnHand() : 0;
                    int toReserveFromLot = Math.min(remainingToReserve, availableInLot);

                    // Create DispenseItem for this reservation
                    DispenseItem dispenseItem = new DispenseItem();
                    dispenseItem.setId(UUID.randomUUID());
                    dispenseItem.setQuantity(toReserveFromLot);
                    dispenseItem.setPriceAtDispense(medicine.getSalePrice() != null ? medicine.getSalePrice() : 0);
                    dispenseItem.setInventoryLot(lot);
                    dispenseItem.setDispenseOrder(dispenseOrder);
                    dispenseItem = dispenseItemRepository.save(dispenseItem);

                    // Store DispenseItem ID for potential rollback
                    //dispenseItemIds.add(dispenseItem.getId().toString());

                    // Update lot quantity
                    lot.setQuantityOnHand(availableInLot - toReserveFromLot);
                    inventoryLotRepository.save(lot);

                    // Record in stock ledger with referenceId = DispenseItem.id
                    StockLedger ledgerEntry = new StockLedger();
                    //ledgerEntry.setId(UUID.randomUUID());
                    ledgerEntry.setLot(lot.getLotNo());
                    ledgerEntry.setType("OUT");
                    ledgerEntry.setQuantity(toReserveFromLot);
                    ledgerEntry.setReferenceId(dispenseItem.getId()); // Reference to DispenseItem
                    ledgerEntry.setReferenceType("DISPENSE_ITEM");
                    ledgerEntry.setInventoryLot(lot);
                    stockLedgerRepository.save(ledgerEntry);

                    remainingToReserve -= toReserveFromLot;
                }

                // Check if all quantity was reserved successfully
                if (remainingToReserve != 0) {
                    throw new RuntimeException("Error calculating reservation for: " + medicine.getName());
                }
            }

            System.out.println("da kiem tra xong kho");

        } catch (Exception e) {
            // FIX: Bắt lỗi để bắn Event thất bại, NHƯNG KHÔNG ĐƯỢC GỌI DB Ở ĐÂY
            System.err.println("Loi giu thuoc, Transaction se Rollback tu dong: " + e.getMessage());
            // Phát sự kiện thất bại để Saga biết đường xử lý (Compensating Transaction ở service khác)
            eventBus.publish(GenericEventMessage.asEventMessage(
                    new MedicineReservationFailedEvent(event.getPrescriptionId())
            ));
            // Quan trọng: Phải ném lại RuntimeException để Spring kích hoạt @Transactional rollback
            // Nếu bạn "nuốt" lỗi mà không ném ra, Spring sẽ tưởng thành công và Commit những gì đã ghi!
            throw new RuntimeException("Rollback Inventory Transaction due to: " + e.getMessage());
        }

    }

    @EventHandler
    @Transactional
    public void on(MedicineReservationReleasedEvent event){
        try {
            // Find all DispenseItems for this prescription by finding DispenseOrder
            List<DispenseOrder> dispenseOrders =
                    dispenseOrderRepository.findAllByPrescription(event.getPrescriptionId());

            dispenseOrders.forEach(order -> order.setStatus("CANCELLED"));
            dispenseOrderRepository.saveAll(dispenseOrders);
            // Rollback all reservations for this prescription
            for (DispenseOrder order : dispenseOrders) {
                List<DispenseItem> dispenseItems = dispenseItemRepository.findAll().stream()
                        .filter(item -> item.getDispenseOrder() != null &&
                                item.getDispenseOrder().getId().equals(order.getId()))
                        .toList();

                for (DispenseItem dispenseItem : dispenseItems) {
                    rollbackDispenseItem(dispenseItem);
                }
            }
            System.out.println("Database rollback successfully for Release");

        } catch (Exception e) {
            // Log error but still emit event (compensation should continue)
            System.err.println("Error releasing medicine reservation: " + e.getMessage());

        }
    }




    /**
     * Rollback a single DispenseItem by restoring inventory and creating reverse StockLedger entry
     */
    private void rollbackDispenseItem(DispenseItem dispenseItem) {
        if (dispenseItem == null || dispenseItem.getInventoryLot() == null) {
            return;
        }

        InventoryLot lot = dispenseItem.getInventoryLot();
        Integer quantityToRestore = dispenseItem.getQuantity();

        // Find all StockLedger entries with referenceId = DispenseItem.id
        List<StockLedger> ledgerEntries = stockLedgerRepository.findAll().stream()
                .filter(ledger -> dispenseItem.getId().toString().equals(ledger.getReferenceId()) &&
                        "OUT".equals(ledger.getType()) &&
                        "DISPENSE_ITEM".equals(ledger.getReferenceType()))
                .toList();

        // Restore quantity to inventory lot
        int currentQuantity = lot.getQuantityOnHand() != null ? lot.getQuantityOnHand() : 0;
        lot.setQuantityOnHand(currentQuantity + quantityToRestore);
        inventoryLotRepository.save(lot);

        // Create reverse StockLedger entry (IN) for rollback
        StockLedger reverseLedgerEntry = new StockLedger();
        reverseLedgerEntry.setId(UUID.randomUUID());
        reverseLedgerEntry.setLot(lot.getLotNo());
        reverseLedgerEntry.setType("IN");
        reverseLedgerEntry.setQuantity(quantityToRestore);
        reverseLedgerEntry.setReferenceId(dispenseItem.getId()); // Still reference DispenseItem
        reverseLedgerEntry.setReferenceType("DISPENSE_ITEM_ROLLBACK");
        reverseLedgerEntry.setInventoryLot(lot);
        stockLedgerRepository.save(reverseLedgerEntry);

        // Optionally delete or mark DispenseItem as cancelled
        // For now, we'll keep it for audit trail
        //dispenseItemRepository.delete(dispenseItem);
    }



}
