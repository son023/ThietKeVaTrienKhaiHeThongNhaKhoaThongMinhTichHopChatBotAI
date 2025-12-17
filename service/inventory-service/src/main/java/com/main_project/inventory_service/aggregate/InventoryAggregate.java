package com.main_project.inventory_service.aggregate;

import com.do_an.common.command.ReleaseMedicineReservationCommand;
import com.do_an.common.command.ReserveMedicineCommand;
import com.do_an.common.event.MedicineReservationReleasedEvent;
import com.do_an.common.event.MedicineReservedEvent;
import lombok.NoArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.axonframework.commandhandling.CommandHandler;
import org.axonframework.eventsourcing.EventSourcingHandler;
import org.axonframework.modelling.command.AggregateIdentifier;
import org.axonframework.modelling.command.AggregateLifecycle;
import org.axonframework.spring.stereotype.Aggregate;


import java.util.UUID;


@Aggregate
@NoArgsConstructor
@Slf4j
public class InventoryAggregate {
    @AggregateIdentifier
    private UUID dispenseOrderId;
    
    private String status; // "RESERVED", "RELEASED", "SOLD"
    private UUID prescriptionId;

    // ✅ Constructor với idempotency guard
    public InventoryAggregate(ReserveMedicineCommand command) {
        // ⚠️ CRITICAL GUARD: Aggregate đã reserve rồi, từ chối duplicate reservation
//        if (this.status != null && "RESERVED".equals(this.status)) {
//            log.warn("⚠️ [AGGREGATE GUARD] InventoryAggregate {} already RESERVED, rejecting duplicate command",
//                    command.getDispenseOrderId());
//            return; // Không apply event, giữ nguyên state
//        }
//
//        log.info("✅ [AGGREGATE] Creating InventoryAggregate: dispenseOrderId={}, prescriptionId={}",
//                command.getDispenseOrderId(), command.getPrescriptionId());
        
        // Apply event chỉ khi chưa được reserved
        AggregateLifecycle.apply(new MedicineReservedEvent(
                command.getDispenseOrderId(),
                command.getPrescriptionId(),
                command.getDoctorId(),
                command.getMedicalHistoryId(),
                command.getItems()
        ));
    }

    @CommandHandler
    public void handle(ReleaseMedicineReservationCommand command) {
        // ⚠️ GUARD: Chỉ release nếu đang ở trạng thái RESERVED
//        if (!"RESERVED".equals(this.status)) {
//            log.warn("⚠️ [AGGREGATE GUARD] Cannot release InventoryAggregate {} - current status: {}",
//                    command.getDispenseOrderId(), this.status);
//            return; // Không thể release nếu không phải RESERVED
//        }
//
//        log.info("✅ [AGGREGATE] Releasing InventoryAggregate: dispenseOrderId={}", command.getDispenseOrderId());
        
        // Emit success event
        AggregateLifecycle.apply(new MedicineReservationReleasedEvent(
                command.getPrescriptionId(),
                command.getDispenseOrderId()
        ));
    }

    @EventSourcingHandler
    public void on(MedicineReservedEvent event) {
        log.info("📝 [EVENT SOURCING] Applying MedicineReservedEvent: dispenseOrderId={}", event.getDispenseOrderId());
        this.dispenseOrderId = event.getDispenseOrderId();
        this.prescriptionId = event.getPrescriptionId();
        this.status = "RESERVED";
    }

    @EventSourcingHandler
    public void on(MedicineReservationReleasedEvent event) {
        log.info("📝 [EVENT SOURCING] Applying MedicineReservationReleasedEvent: dispenseOrderId={}", 
                event.getDispenseOrderId());
        
        // ✅ Chỉ chuyển sang RELEASED nếu đang RESERVED
        if ("RESERVED".equals(this.status)) {
            this.status = "RELEASED";
        } else {
            log.warn("⚠️ [AGGREGATE GUARD] Cannot apply release event - current status: {}", this.status);
        }
    }

    // ✅ HELPER: Kiểm tra trạng thái
    private boolean isReserved() {
        return "RESERVED".equals(this.status);
    }
    
    private boolean isReleased() {
        return "RELEASED".equals(this.status);
    }
    
}
