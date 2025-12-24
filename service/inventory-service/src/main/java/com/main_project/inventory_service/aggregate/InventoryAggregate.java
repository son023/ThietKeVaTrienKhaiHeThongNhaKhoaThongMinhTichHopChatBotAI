package com.main_project.inventory_service.aggregate;

import com.do_an.common.command.ReturnMedicineReservationCommand;
import com.do_an.common.event.MedicineReservationReleaseEvent;
import com.do_an.common.event.MedicineReservationReturnEvent;
import com.do_an.common.event.MedicineReservationSoldEvent;
import com.do_an.common.event.MedicineReservedEvent;
import com.do_an.common.model.MedicineItem;
import lombok.NoArgsConstructor;
import org.axonframework.commandhandling.CommandHandler;
import org.axonframework.eventsourcing.EventSourcingHandler;
import org.axonframework.modelling.command.AggregateIdentifier;
import org.axonframework.modelling.command.AggregateLifecycle;
import org.axonframework.spring.stereotype.Aggregate;


import java.util.List;
import java.util.UUID;


@Aggregate
@NoArgsConstructor
public class InventoryAggregate {
    @AggregateIdentifier
    private UUID dispenseOrderId;

    public InventoryAggregate(UUID dispenseOrderId, UUID prescriptionId, UUID doctorId, UUID medicalHistoryId, List<MedicineItem> items) {
        AggregateLifecycle.apply(new MedicineReservedEvent(
                dispenseOrderId,
                prescriptionId,
                doctorId,
                medicalHistoryId,
                items
        ));
    }

    public void applyPrescriptionRelease(UUID dispenseOrderId){
        AggregateLifecycle.apply(new MedicineReservationReleaseEvent(
                dispenseOrderId
        ));
    }

    public void applyPrescriptionSold(UUID dispenseOrderId){
        AggregateLifecycle.apply(new MedicineReservationSoldEvent(
                dispenseOrderId
        ));
    }

    @CommandHandler
    public void handle(ReturnMedicineReservationCommand command) {
        // Emit success event
        AggregateLifecycle.apply(new MedicineReservationReturnEvent(
                command.getPrescriptionId(),
                command.getDispenseOrderId()
        ));
    }

    @EventSourcingHandler
    public void on(MedicineReservedEvent event) {
        this.dispenseOrderId = event.getDispenseOrderId();
    }

    @EventSourcingHandler
    public void on(MedicineReservationReturnEvent event) {
        this.dispenseOrderId = event.getDispenseOrderId();
    }


    @EventSourcingHandler
    public void on(MedicineReservationReleaseEvent event){
        this.dispenseOrderId = event.getDispenseOrderId();
    }
}
