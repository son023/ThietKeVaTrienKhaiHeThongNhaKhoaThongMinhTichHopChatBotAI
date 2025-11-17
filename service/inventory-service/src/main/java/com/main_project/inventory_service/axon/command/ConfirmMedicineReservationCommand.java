package com.main_project.inventory_service.axon.command;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.axonframework.modelling.command.TargetAggregateIdentifier;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class ConfirmMedicineReservationCommand {
    
    @TargetAggregateIdentifier
    private String reservationId;
    
    private String dispenseOrderId;
}


