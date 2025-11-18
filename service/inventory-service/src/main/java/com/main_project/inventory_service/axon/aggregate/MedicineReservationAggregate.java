package com.main_project.inventory_service.axon.aggregate;

import com.main_project.coreapi.inventory.commands.CancelMedicineReservationCommand;
import com.main_project.coreapi.inventory.commands.ConfirmMedicineReservationCommand;
import com.main_project.coreapi.inventory.commands.ReserveMedicineCommand;
import com.main_project.coreapi.inventory.events.MedicineReservationCancelledEvent;
import com.main_project.coreapi.inventory.events.MedicineReservationConfirmedEvent;
import com.main_project.coreapi.inventory.events.MedicineReservationFailedEvent;
import com.main_project.coreapi.inventory.events.MedicineReservedEvent;
import com.main_project.inventory_service.repository.MedicineRepository;
import com.main_project.inventory_service.entity.Medicine;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.axonframework.commandhandling.CommandHandler;
import org.axonframework.eventsourcing.EventSourcingHandler;
import org.axonframework.modelling.command.AggregateIdentifier;
import org.axonframework.modelling.command.AggregateLifecycle;
import org.axonframework.spring.stereotype.Aggregate;
import org.springframework.beans.factory.annotation.Autowired;

import java.time.Instant;
import java.util.Optional;
import java.util.UUID;

@Aggregate
@Data
@NoArgsConstructor
@Slf4j
public class
MedicineReservationAggregate {
    
    @AggregateIdentifier
    private String reservationId;
    
    private String medicineId;
    private Integer quantity;
    private String patientId;
    private String claimId;
    private String sagaId;
    private String status; // RESERVED, CONFIRMED, CANCELLED, FAILED
    private String dispenseOrderId;
    
    // Note: Repository injection in aggregates is not recommended in Axon
    // Business logic should be in domain services
    
    @CommandHandler
    public MedicineReservationAggregate(ReserveMedicineCommand command) {
        log.info("Xử lý command đặt trước thuốc: {} - Số lượng: {}", command.getMedicineId(), command.getQuantity());
        
        // Validation
        if (command.getQuantity() <= 0) {
            throw new IllegalArgumentException("Số lượng thuốc phải lớn hơn 0");
        }
        
        // Kiểm tra tồn kho (Business logic)
        try {
            // Note: Trong thực tế, logic này nên được inject dependency vào aggregate
            // Ở đây mình demo đơn giản
            if (!checkMedicineAvailability(command.getMedicineId(), command.getQuantity())) {
                MedicineReservationFailedEvent failedEvent = new MedicineReservationFailedEvent(
                        command.getReservationId(),
                        command.getMedicineId(),
                        command.getQuantity(),
                        "Không đủ thuốc trong kho. Yêu cầu: " + command.getQuantity(),
                        command.getSagaId(),
                        Instant.now()
                );
                
                AggregateLifecycle.apply(failedEvent);
                return;
            }
            
            // Thành công - đặt trước thuốc
            MedicineReservedEvent event = new MedicineReservedEvent(
                    command.getReservationId(),
                    command.getMedicineId(),
                    command.getQuantity(),
                    command.getPatientId(),
                    command.getClaimId(),
                    command.getSagaId(),
                    Instant.now()
            );
            
            AggregateLifecycle.apply(event);
            
        } catch (Exception e) {
            log.error("Lỗi khi kiểm tra tồn kho: {}", e.getMessage());
            
            MedicineReservationFailedEvent failedEvent = new MedicineReservationFailedEvent(
                    command.getReservationId(),
                    command.getMedicineId(),
                    command.getQuantity(),
                    "Lỗi hệ thống khi kiểm tra tồn kho: " + e.getMessage(),
                    command.getSagaId(),
                    Instant.now()
            );
            
            AggregateLifecycle.apply(failedEvent);
        }
    }
    
    @CommandHandler
    public void handle(ConfirmMedicineReservationCommand command) {
        log.info("Xử lý command xác nhận đặt trước thuốc: {}", command.getReservationId());
        
        if (!"RESERVED".equals(this.status)) {
            throw new IllegalStateException("Chỉ có thể xác nhận reservation ở trạng thái RESERVED");
        }
        
        MedicineReservationConfirmedEvent event = new MedicineReservationConfirmedEvent(
                command.getReservationId(),
                command.getDispenseOrderId(),
                Instant.now()
        );
        
        AggregateLifecycle.apply(event);
    }
    
    @CommandHandler
    public void handle(CancelMedicineReservationCommand command) {
        log.info("Xử lý command hủy đặt trước thuốc: {}", command.getReservationId());
        
        if ("CONFIRMED".equals(this.status)) {
            throw new IllegalStateException("Không thể hủy reservation đã được xác nhận");
        }
        
        MedicineReservationCancelledEvent event = new MedicineReservationCancelledEvent(
                command.getReservationId(),
                command.getCancellationReason(),
                Instant.now()
        );
        
        AggregateLifecycle.apply(event);
    }
    
    /**
     * Kiểm tra tồn kho thuốc
     * Trong thực tế, logic này nên được implement thông qua domain service
     */
    private boolean checkMedicineAvailability(String medicineId, Integer requestedQuantity) {
        // Mock logic - trong thực tế nên query từ database
        // Giả sử thuốc có ID chứa "available" thì có đủ số lượng
        if (medicineId.toLowerCase().contains("available")) {
            return true;
        }
        
        // Giả sử thuốc có ID chứa "outofstock" thì không đủ số lượng  
        if (medicineId.toLowerCase().contains("outofstock")) {
            return false;
        }
        
        // Default: có sẵn (để demo thành công)
        return true;
    }
    
    @EventSourcingHandler
    public void on(MedicineReservedEvent event) {
        this.reservationId = event.getReservationId();
        this.medicineId = event.getMedicineId();
        this.quantity = event.getQuantity();
        this.patientId = event.getPatientId();
        this.claimId = event.getClaimId();
        this.sagaId = event.getSagaId();
        this.status = "RESERVED";
        
        log.info("Thuốc được đặt trước: {} - Số lượng: {}", this.medicineId, this.quantity);
    }
    
    @EventSourcingHandler
    public void on(MedicineReservationFailedEvent event) {
        this.reservationId = event.getReservationId();
        this.medicineId = event.getMedicineId();
        this.quantity = event.getRequestedQuantity();
        this.sagaId = event.getSagaId();
        this.status = "FAILED";
        
        log.error("Đặt trước thuốc thất bại: {} - Lý do: {}", this.medicineId, event.getFailureReason());
    }
    
    @EventSourcingHandler
    public void on(MedicineReservationConfirmedEvent event) {
        this.dispenseOrderId = event.getDispenseOrderId();
        this.status = "CONFIRMED";
        
        log.info("Đặt trước thuốc được xác nhận: {} với order: {}", this.reservationId, this.dispenseOrderId);
    }
    
    @EventSourcingHandler
    public void on(MedicineReservationCancelledEvent event) {
        this.status = "CANCELLED";
        
        log.info("Đặt trước thuốc bị hủy: {} với lý do: {}", this.reservationId, event.getCancellationReason());
    }
}


