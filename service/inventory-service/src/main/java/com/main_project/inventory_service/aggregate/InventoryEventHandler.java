package com.main_project.inventory_service.aggregate;

import com.do_an.common.event.*;
import com.do_an.common.model.MedicineItem;
import com.main_project.inventory_service.dto.*;
import com.main_project.inventory_service.iservice.IDispenseOrderService;
import com.main_project.inventory_service.iservice.IDispenseItemService;
import com.main_project.inventory_service.iservice.IInventoryLotService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.transaction.annotation.Transactional;
import lombok.RequiredArgsConstructor;
import org.axonframework.eventhandling.EventBus;
import org.axonframework.eventhandling.EventHandler;
import org.axonframework.eventhandling.GenericEventMessage;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.UUID;

import static org.axonframework.eventhandling.GenericEventMessage.asEventMessage;

@Component
@RequiredArgsConstructor
@Slf4j
public class InventoryEventHandler {

    private final IDispenseOrderService dispenseOrderService;
    private final IDispenseItemService dispenseItemService;
    private final IInventoryLotService inventoryLotService;
    private final EventBus eventBus;

    @EventHandler
    @Transactional
    public void on(MedicineReservedEvent event) {
        try {
            // Sử dụng service để tạo dispense order
            DispenseOrderCreationRequest orderRequest = DispenseOrderCreationRequest.builder()
                    .dispenseOrderId(event.getDispenseOrderId())
                    .prescriptionId(event.getPrescriptionId())
                    .doctorId(event.getDoctorId())
                    .medicalHistoryId(event.getMedicalHistoryId())
                    .build();

            dispenseOrderService.createDispenseOrderFromReservation(orderRequest);

            // Lấy dispense order để lấy pharmacistId nếu có
            DispenseOrderResponse dispenseOrderResponse = dispenseOrderService.getById(event.getDispenseOrderId());
            UUID pharmacistId = dispenseOrderResponse.getPharmacistId();

            // Sử dụng service để phân bổ và tạo dispense items
            for (MedicineItem item : event.getItems()) {
                MedicineAllocationRequest allocationRequest = MedicineAllocationRequest.builder()
                        .medicineId(item.getMedicineId())
                        .dispenseOrderId(event.getDispenseOrderId())
                        .quantity(item.getQuantity())
                        .priceAtDispense(item.getUnitPrice())
                        .dosage(item.getDosage())
                        .duration(item.getDuration())
                        .frequency(item.getFrequency())
                        .usageInstructions(item.getInstruction())
                        .pharmacistId(pharmacistId)
                        .build();

                // 1. Allocate quantity từ lots
                List<LotAllocationResult> allocationResults = 
                        inventoryLotService.allocateQuantityForDispense(allocationRequest);

                // 2. Tạo DispenseItem cho mỗi allocation
                for (LotAllocationResult allocationResult : allocationResults) {
                    DispenseItemCreationRequest dispenseItemRequest = DispenseItemCreationRequest.builder()
                            .dispenseItemId(UUID.randomUUID())
                            .dispenseOrderId(event.getDispenseOrderId())
                            .inventoryLotId(allocationResult.getInventoryLotId())
                            .medicineId(item.getMedicineId())
                            .quantity(allocationResult.getQuantity())
                            .priceAtDispense(allocationResult.getPriceAtDispense())
                            .dosage(item.getDosage())
                            .duration(item.getDuration())
                            .frequency(item.getFrequency())
                            .usageInstructions(item.getInstruction())
                            .build();

                    DispenseItemResponse dispenseItemResponse = 
                            dispenseItemService.createDispenseItemFromReservation(dispenseItemRequest);

                    // 3. Tạo stock ledger entry
                    StockLedgerEntryRequest ledgerRequest = StockLedgerEntryRequest.builder()
                            .inventoryLotId(allocationResult.getInventoryLotId())
                            .pharmacistId(pharmacistId)
                            .type("OUT")
                            .quantity(allocationResult.getQuantity())
                            .referenceType("AUTO_DISPENSE")
                            .referenceId(dispenseItemResponse.getId())
                            .build();

                    inventoryLotService.createStockLedgerEntry(ledgerRequest);
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
    public void on(MedicineReservationReturnEvent event) {
        try {
            // Sử dụng service để hủy orders
            dispenseOrderService.cancelAllByPrescriptionId(event.getPrescriptionId());

            // Sử dụng service để rollback items
            List<DispenseOrderResponse> orders = dispenseOrderService.getAllByPrescriptionId(event.getPrescriptionId());

            for (DispenseOrderResponse order : orders) {
                List<DispenseItemResponse> items = dispenseItemService.getAllByDispenseOrderId(order.getId());
                
                for (DispenseItemResponse item : items) {
                    // 1. Rollback DispenseItem và lấy thông tin cần restore
                    DispenseItemRollbackResult rollbackResult = 
                            dispenseItemService.rollbackDispenseItem(item.getId());

                    if (rollbackResult != null) {
                        // 2. Restore quantity to lot
                        InventoryRestoreRequest restoreRequest = InventoryRestoreRequest.builder()
                                .inventoryLotId(rollbackResult.getInventoryLotId())
                                .quantity(rollbackResult.getQuantity())
                                .build();

                        inventoryLotService.restoreQuantityToLot(restoreRequest);

                        // 3. Tạo stock ledger entry
                        StockLedgerEntryRequest ledgerRequest = StockLedgerEntryRequest.builder()
                                .inventoryLotId(rollbackResult.getInventoryLotId())
                                .pharmacistId(rollbackResult.getPharmacistId())
                                .type("IN")
                                .quantity(rollbackResult.getQuantity())
                                .referenceType("AUTO_ROLLBACK")
                                .referenceId(item.getId())
                                .build();

                        inventoryLotService.createStockLedgerEntry(ledgerRequest);
                    }
                }
            }

            log.info("Đã rollback kho thành công cho Return");

        } catch (Exception e) {
            log.error("Lỗi khi rollback kho: {}", e.getMessage());
        }
    }

    @EventHandler
    @Transactional
    public void on(MedicineReservationReleaseEvent event) {
        try {
            log.info("Nhận sự kiện MedicineReservationReleaseEvent. Cập nhật trạng thái RELEASED cho DispenseOrder: {}",
                    event.getDispenseOrderId());

            // Sử dụng service để cập nhật status
            dispenseOrderService.updateStatus(event.getDispenseOrderId(), "RELEASED");

            log.info("Đã cập nhật DispenseOrder {} thành công (RELEASED).", event.getDispenseOrderId());

        } catch (Exception e) {
            log.error("Lỗi khi xử lý MedicineReservationReleaseEvent cho DispenseOrder {}: {}",
                    event.getDispenseOrderId(), e.getMessage(), e);
        }
    }

    @EventHandler
    @Transactional
    public void on(MedicineReservationSoldEvent event) {
        try {
            log.info("Nhận sự kiện MedicineReservationSoldEvent. Cập nhật trạng thái SOLD cho DispenseOrder: {}",
                    event.getDispenseOrderId());

            // Sử dụng service để cập nhật status
            dispenseOrderService.updateStatus(event.getDispenseOrderId(), "SOLD");

            log.info("Đã cập nhật DispenseOrder {} thành công (SOLD).", event.getDispenseOrderId());

        } catch (Exception e) {
            log.error("Lỗi khi xử lý MedicineReservationSoldEvent cho DispenseOrder {}: {}",
                    event.getDispenseOrderId(), e.getMessage(), e);
        }
    }
}
