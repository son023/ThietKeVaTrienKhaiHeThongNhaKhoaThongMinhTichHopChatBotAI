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
            DispenseOrder dispenseOrder = new DispenseOrder();
            dispenseOrder.setId(event.getDispenseOrderId());
            dispenseOrder.setPrescription(event.getPrescriptionId());
            dispenseOrder.setMedicalHistoryId(event.getMedicalHistoryId());
            dispenseOrder.setDoctorId(event.getDoctorId());
            dispenseOrder.setStatus("RESERVED");
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
                    dispenseItem.setDispenseOrder(dispenseOrder);
                    dispenseItem = dispenseItemRepository.save(dispenseItem);

                    lot.setQuantityOnHand(availableInLot - toReserveFromLot);
                    inventoryLotRepository.save(lot);

                    StockLedger ledgerEntry = new StockLedger();
                    //ledgerEntry.setId(UUID.randomUUID());
                    ledgerEntry.setType("OUT");
                    ledgerEntry.setQuantity(toReserveFromLot);
                    ledgerEntry.setReferenceId(dispenseItem.getId()); // Reference to DispenseItem
                    ledgerEntry.setReferenceType("DISPENSE_ITEM");
                    ledgerEntry.setInventoryLot(lot);
                    stockLedgerRepository.save(ledgerEntry);

                    remainingToReserve -= toReserveFromLot;
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


        List<StockLedger> ledgerEntries = stockLedgerRepository.findAll().stream()
                .filter(ledger -> dispenseItem.getId().toString().equals(ledger.getReferenceId()) &&
                        "OUT".equals(ledger.getType()) &&
                        "DISPENSE_ITEM".equals(ledger.getReferenceType()))
                .toList();

        int currentQuantity = lot.getQuantityOnHand() != null ? lot.getQuantityOnHand() : 0;
        lot.setQuantityOnHand(currentQuantity + quantityToRestore);
        inventoryLotRepository.save(lot);

        StockLedger reverseLedgerEntry = new StockLedger();
        reverseLedgerEntry.setId(UUID.randomUUID());
        reverseLedgerEntry.setType("IN");
        reverseLedgerEntry.setQuantity(quantityToRestore);
        reverseLedgerEntry.setReferenceId(dispenseItem.getId()); //reference DispenseItem
        reverseLedgerEntry.setReferenceType("DISPENSE_ITEM_ROLLBACK");
        reverseLedgerEntry.setInventoryLot(lot);
        stockLedgerRepository.save(reverseLedgerEntry);
    }


}
