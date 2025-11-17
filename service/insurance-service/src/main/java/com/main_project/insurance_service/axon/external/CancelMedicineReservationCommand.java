package com.main_project.insurance_service.axon.external;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.axonframework.modelling.command.TargetAggregateIdentifier;

/**
 * External command để gửi đến Inventory Service
 */
@Data
@AllArgsConstructor
@NoArgsConstructor
public class CancelMedicineReservationCommand {
    
    @TargetAggregateIdentifier
    private String reservationId;
    
    private String cancellationReason;
}


