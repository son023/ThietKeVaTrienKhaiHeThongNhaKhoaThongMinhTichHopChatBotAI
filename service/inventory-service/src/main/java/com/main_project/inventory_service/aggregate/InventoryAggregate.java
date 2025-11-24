package com.main_project.inventory_service.aggregate;

import com.do_an.common.command.ReleaseMedicineReservationCommand;
import com.do_an.common.command.ReserveMedicineCommand;
import com.do_an.common.event.MedicineReservationFailedEvent;
import com.do_an.common.event.MedicineReservationReleasedEvent;
import com.do_an.common.event.MedicineReservedEvent;
import com.do_an.common.model.MedicineItem;
import com.main_project.inventory_service.entity.DispenseItem;
import com.main_project.inventory_service.entity.DispenseOrder;
import com.main_project.inventory_service.entity.InventoryLot;
import com.main_project.inventory_service.entity.Medicine;
import com.main_project.inventory_service.entity.StockLedger;
import com.main_project.inventory_service.repository.DispenseItemRepository;
import com.main_project.inventory_service.repository.DispenseOrderRepository;
import com.main_project.inventory_service.repository.InventoryLotRepository;
import com.main_project.inventory_service.repository.MedicineRepository;
import com.main_project.inventory_service.repository.StockLedgerRepository;
import lombok.NoArgsConstructor;
import lombok.RequiredArgsConstructor;
import org.axonframework.commandhandling.CommandHandler;
import org.axonframework.eventsourcing.EventSourcingHandler;
import org.axonframework.modelling.command.AggregateIdentifier;
import org.axonframework.modelling.command.AggregateLifecycle;
import org.axonframework.spring.stereotype.Aggregate;
import org.springframework.beans.factory.annotation.Autowired;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Aggregate
@NoArgsConstructor
public class InventoryAggregate {

    @AggregateIdentifier
    private UUID dispenseOrderId;

    @CommandHandler
    public InventoryAggregate(ReserveMedicineCommand command) {
        this.dispenseOrderId = command.getDispenseOrderId();
        // All medicines reserved successfully
        AggregateLifecycle.apply(new MedicineReservedEvent(
                command.getPrescriptionId(),
                command.getDispenseOrderId(),
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
