package com.main_project.inventory_service.axon.command;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.axonframework.modelling.command.TargetAggregateIdentifier;

import java.util.UUID;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class ReserveMedicineCommand {
    
    @TargetAggregateIdentifier
    private String reservationId;
    
    private String medicineId;
    private Integer quantity;
    private String patientId;
    private String claimId;
    private String sagaId; // Để theo dõi saga transaction
}


