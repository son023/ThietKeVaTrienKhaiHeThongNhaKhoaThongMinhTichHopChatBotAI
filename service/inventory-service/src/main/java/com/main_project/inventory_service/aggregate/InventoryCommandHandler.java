package com.main_project.inventory_service.aggregate;

import com.do_an.common.command.ReserveMedicineCommand;
import com.do_an.common.model.MedicineItem;
import com.main_project.inventory_service.entity.InventoryLot;
import com.main_project.inventory_service.entity.Medicine;
import com.main_project.inventory_service.repository.InventoryLotRepository;
import com.main_project.inventory_service.repository.MedicineRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.axonframework.commandhandling.CommandHandler;
import org.axonframework.modelling.command.Repository;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.Comparator;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Component
@RequiredArgsConstructor
@Slf4j
public class InventoryCommandHandler {

    private final InventoryLotRepository inventoryLotRepository;
    private final MedicineRepository medicineRepository;

    private final Repository<InventoryAggregate> inventoryAggregateRepository;

    @CommandHandler
    @Transactional(readOnly = true)
    public void handle(ReserveMedicineCommand command) throws Exception {
        log.info("📥 [COMMAND] ReserveMedicineCommand: dispenseOrderId={}, prescriptionId={}", 
                command.getDispenseOrderId(), command.getPrescriptionId());

        // ✅ IDEMPOTENCY CHECK: Load aggregate để kiểm tra đã tồn tại chưa
        try {
            inventoryAggregateRepository.load(command.getDispenseOrderId().toString());
            log.warn("⚠️ [COMMAND HANDLER GUARD] InventoryAggregate {} already exists, skipping creation", 
                    command.getDispenseOrderId());
            return; // Aggregate đã tồn tại, không tạo mới
        } catch (Exception loadException) {
            // Aggregate chưa tồn tại, tiếp tục validate và tạo mới
            log.info("✅ [COMMAND HANDLER] InventoryAggregate {} not found, proceeding with validation", 
                    command.getDispenseOrderId());
        }

        // ✅ VALIDATION: Kiểm tra tồn kho trước khi tạo aggregate
        for (MedicineItem item : command.getItems()) {
            UUID medicineId = item.getMedicineId();
            Medicine medicine = medicineRepository.findById(medicineId)
                    .orElseThrow(() -> new RuntimeException("Không tìm thấy thuốc: " + item.getMedicineId()));

            List<InventoryLot> availableLots = inventoryLotRepository.findAll().stream()
                    .filter(lot -> lot.getMedicine() != null &&
                            lot.getMedicine().getId().equals(item.getMedicineId()) &&
                            lot.getQuantityOnHand() != null &&
                            lot.getQuantityOnHand() > 0 &&
                            (lot.getExpireDate() == null || !lot.getExpireDate().isBefore(LocalDate.now())))
                    .sorted(Comparator.comparing(InventoryLot::getExpireDate, Comparator.nullsLast(Comparator.naturalOrder())))
                    .collect(Collectors.toList());

            int totalAvailable = availableLots.stream()
                    .mapToInt(lot -> lot.getQuantityOnHand() != null ? lot.getQuantityOnHand() : 0)
                    .sum();

            if (totalAvailable < item.getQuantity()) {
                throw new IllegalStateException("Không đủ tồn kho cho thuốc: " + item.getName()
                        + ". Yêu cầu: " + item.getQuantity()
                        + ", Tổng khả dụng: " + totalAvailable);
            }

            int remainingToReserve = item.getQuantity();

            for (InventoryLot lot : availableLots) {
                if (remainingToReserve <= 0) {
                    break;
                }
                int availableInLot = lot.getQuantityOnHand() != null ? lot.getQuantityOnHand() : 0;
                int toReserveFromLot = Math.min(remainingToReserve, availableInLot);
                remainingToReserve -= toReserveFromLot;
            }

            if (remainingToReserve != 0) {
                throw new IllegalStateException("Lỗi tính toán phân bổ lô hàng cho thuốc: " + item.getName()
                        + ". Vẫn còn thiếu: " + remainingToReserve);
            }
        }

        log.info("✅ [COMMAND HANDLER] Validation thành công. Khởi tạo InventoryAggregate.");

        inventoryAggregateRepository.newInstance(() -> new InventoryAggregate(command));
    }
}