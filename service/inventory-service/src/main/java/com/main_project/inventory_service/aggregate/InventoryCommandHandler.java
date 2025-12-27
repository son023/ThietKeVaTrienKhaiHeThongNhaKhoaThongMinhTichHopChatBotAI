package com.main_project.inventory_service.aggregate;

import com.do_an.common.command.MarkPrescripAsReleaseCommand;
import com.do_an.common.command.MarkPrescripAsSoldCommand;
import com.do_an.common.command.ReserveMedicineCommand;
import com.do_an.common.command.ReturnMedicineReservationCommand;
import com.do_an.common.event.MedicineReservationReturnEvent;
import com.do_an.common.model.MedicineItem;
import com.main_project.inventory_service.entity.DispenseOrder;
import com.main_project.inventory_service.entity.InventoryLot;
import com.main_project.inventory_service.entity.Medicine;
import com.main_project.inventory_service.repository.DispenseOrderRepository;
import com.main_project.inventory_service.repository.InventoryLotRepository;
import com.main_project.inventory_service.repository.MedicineRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.axonframework.commandhandling.CommandHandler;
import org.axonframework.modelling.command.AggregateLifecycle;
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
    private final DispenseOrderRepository dispenseOrderRepository;
    private final InventoryLotRepository inventoryLotRepository;
    private final MedicineRepository medicineRepository;

    private final Repository<InventoryAggregate> inventoryAggregateRepository;

    @CommandHandler
    @Transactional(readOnly = true)
    public void handle(ReserveMedicineCommand command) throws Exception {
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

        log.info("Validation thành công. Khởi tạo Aggregate.");

        inventoryAggregateRepository.newInstance(() -> new InventoryAggregate(command.getDispenseOrderId(), command.getPrescriptionId(), command.getDoctorId(),
                command.getMedicalHistoryId(), command.getItems()));
    }

    @CommandHandler
    public void handle(ReturnMedicineReservationCommand command) {
        DispenseOrder dispenseOrder = dispenseOrderRepository.findById(command.getDispenseOrderId())
                .orElseThrow(() -> new IllegalStateException("Không tìm thấy đơn thuốc: " + command.getDispenseOrderId()));

        if ("SOLD".equals(dispenseOrder.getStatus())) {
            throw new IllegalStateException("Không thể hoàn thuốc cho đơn thuốc đã bán");
        }

        inventoryAggregateRepository.load(command.getDispenseOrderId().toString())
                .execute(aggregate -> aggregate.applyReturnReservation(
                        command.getPrescriptionId(),
                        command.getDispenseOrderId()
                ));
    }

    @CommandHandler
    @Transactional
    public void handle(MarkPrescripAsReleaseCommand command) throws Exception{
        DispenseOrder dispenseOrder = dispenseOrderRepository.findById(command.getDispenseOrderId())
                .orElseThrow(() -> new IllegalStateException("Không tìm thấy đơn thuốc: " + command.getDispenseOrderId()));

        if ("CANCELLED".equals(dispenseOrder.getStatus())) {
            throw new IllegalStateException("Không thể cấp phát đơn thuốc đã bị hủy.");
        }



        inventoryAggregateRepository.load(command.getDispenseOrderId().toString())
                .execute(aggregate -> aggregate.applyPrescriptionRelease(
                        command.getDispenseOrderId()
                ));
    }

    @CommandHandler
    @Transactional
    public void handle(MarkPrescripAsSoldCommand command) throws Exception{
        DispenseOrder dispenseOrder = dispenseOrderRepository.findById(command.getDispenseOrderId())
                .orElseThrow(() -> new IllegalStateException("Không tìm thấy đơn thuốc: " + command.getDispenseOrderId()));

        if ("CANCELLED".equals(dispenseOrder.getStatus())) {
            throw new IllegalStateException("Không thể cấp phát đơn thuốc đã bị hủy.");
        }

        inventoryAggregateRepository.load(command.getDispenseOrderId().toString())
                .execute(aggregate -> aggregate.applyPrescriptionSold(
                        command.getDispenseOrderId()
                ));
    }

}