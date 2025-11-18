package com.main_project.coreapi.inventory.commands;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.axonframework.modelling.command.TargetAggregateIdentifier;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class CancelMedicineReservationCommand {
    
    @TargetAggregateIdentifier
    private String reservationId;
    
    private String cancellationReason;
}

