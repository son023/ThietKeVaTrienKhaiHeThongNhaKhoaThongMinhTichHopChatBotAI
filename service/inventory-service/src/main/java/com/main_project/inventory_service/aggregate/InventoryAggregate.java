package com.main_project.inventory_service.aggregate;

import com.do_an.common.command.ReleaseMedicineReservationCommand;
import com.do_an.common.command.ReserveMedicineCommand;
import com.do_an.common.event.MedicineReservationReleasedEvent;
import com.do_an.common.event.MedicineReservedEvent;
import lombok.NoArgsConstructor;
import org.axonframework.commandhandling.CommandHandler;
import org.axonframework.eventsourcing.EventSourcingHandler;
import org.axonframework.modelling.command.AggregateIdentifier;
import org.axonframework.modelling.command.AggregateLifecycle;
import org.axonframework.spring.stereotype.Aggregate;


import java.util.UUID;


@Aggregate
@NoArgsConstructor
public class InventoryAggregate {
    @AggregateIdentifier
    private UUID dispenseOrderId;

    public InventoryAggregate(ReserveMedicineCommand command) {
        AggregateLifecycle.apply(new MedicineReservedEvent(
                command.getPrescriptionId(),
                command.getDispenseOrderId(),
                command.getDoctorId(),
                command.getMedicalHistoryId(),
                command.getItems()
        ));
    }

    @CommandHandler
    public void handle(ReleaseMedicineReservationCommand command) {
            // Emit success event
            AggregateLifecycle.apply(new MedicineReservationReleasedEvent(
                    command.getPrescriptionId(),
                    command.getDispenseOrderId()
            ));
    }

    @EventSourcingHandler
    public void on(MedicineReservedEvent event) {
        this.dispenseOrderId = event.getDispenseOrderId();
    }

    @EventSourcingHandler
    public void on(MedicineReservationReleasedEvent event) {
        this.dispenseOrderId = event.getDispenseOrderId();
    }
    
}
