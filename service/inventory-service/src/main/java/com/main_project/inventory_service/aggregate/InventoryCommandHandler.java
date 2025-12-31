package com.main_project.inventory_service.aggregate;

import com.do_an.common.command.MarkPrescripAsReleaseCommand;
import com.do_an.common.command.MarkPrescripAsSoldCommand;
import com.do_an.common.command.ReserveMedicineCommand;
import com.do_an.common.command.ReturnMedicineReservationCommand;
import com.do_an.common.model.MedicineItem;
import com.main_project.inventory_service.dto.InventoryLotResponse;
import com.main_project.inventory_service.iservice.IMedicineService;
import com.main_project.inventory_service.iservice.IInventoryLotService;
import com.main_project.inventory_service.iservice.IDispenseOrderService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.axonframework.commandhandling.CommandHandler;
import org.axonframework.modelling.command.Repository;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Component
@RequiredArgsConstructor
@Slf4j
public class InventoryCommandHandler {
    
    private final IMedicineService medicineService;
    private final IInventoryLotService inventoryLotService;
    private final IDispenseOrderService dispenseOrderService;
    private final Repository<InventoryAggregate> inventoryAggregateRepository;

    @CommandHandler
    @Transactional(readOnly = true)
    public void handle(ReserveMedicineCommand command) throws Exception {
        for (MedicineItem item : command.getItems()) {
            UUID medicineId = item.getMedicineId();
            
            // Sử dụng service để kiểm tra medicine
            if (!medicineService.existsById(medicineId)) {
                throw new RuntimeException("Không tìm thấy thuốc: " + medicineId);
            }

            // Sử dụng service để kiểm tra tồn kho
            int totalAvailable = inventoryLotService.getTotalAvailableQuantity(medicineId);
            
            if (totalAvailable < item.getQuantity()) {
                throw new IllegalStateException("Không đủ tồn kho cho thuốc: " + item.getName()
                        + ". Yêu cầu: " + item.getQuantity()
                        + ", Tổng khả dụng: " + totalAvailable);
            }

            // Validation phân bổ (kiểm tra các lô có đủ không)
//            List<InventoryLotResponse> availableLots = inventoryLotService.getAvailableLotsForMedicine(medicineId);
//
//            int totalFromLots = availableLots.stream()
//                    .mapToInt(lot -> lot.getQuantityOnHand() != null ? lot.getQuantityOnHand() : 0)
//                    .sum();
//
//            if (totalFromLots < item.getQuantity()) {
//                throw new IllegalStateException("Lỗi tính toán phân bổ lô hàng cho thuốc: " + item.getName()
//                        + ". Tổng từ lô: " + totalFromLots + ", Yêu cầu: " + item.getQuantity());
//            }


        }

        log.info("Validation thành công. Khởi tạo Aggregate.");

        inventoryAggregateRepository.newInstance(() -> new InventoryAggregate(
                command.getDispenseOrderId(), 
                command.getPrescriptionId(), 
                command.getDoctorId(),
                command.getMedicalHistoryId(), 
                command.getItems()
        ));
    }

    @CommandHandler
    public void handle(ReturnMedicineReservationCommand command) {
        // Sử dụng service để kiểm tra
        if (!dispenseOrderService.canReturnReservation(command.getDispenseOrderId())) {
            throw new IllegalStateException("Không thể hoàn thuốc cho đơn thuốc này");
        }

        inventoryAggregateRepository.load(command.getDispenseOrderId().toString())
                .execute(aggregate -> aggregate.applyReturnReservation(
                        command.getPrescriptionId(),
                        command.getDispenseOrderId()
                ));
    }

    @CommandHandler
    @Transactional
    public void handle(MarkPrescripAsReleaseCommand command) throws Exception {
        // Sử dụng service để kiểm tra
        if (!dispenseOrderService.canReleasePrescription(command.getDispenseOrderId())) {
            throw new IllegalStateException("Không thể cấp phát đơn thuốc này");
        }

        inventoryAggregateRepository.load(command.getDispenseOrderId().toString())
                .execute(aggregate -> aggregate.applyPrescriptionRelease(
                        command.getDispenseOrderId()
                ));
    }

    @CommandHandler
    @Transactional
    public void handle(MarkPrescripAsSoldCommand command) throws Exception {
        // Sử dụng service để kiểm tra
        if (!dispenseOrderService.canMarkAsSold(command.getDispenseOrderId())) {
            throw new IllegalStateException("Không thể đánh dấu đơn thuốc này là đã bán");
        }

        inventoryAggregateRepository.load(command.getDispenseOrderId().toString())
                .execute(aggregate -> aggregate.applyPrescriptionSold(
                        command.getDispenseOrderId()
                ));
    }
}