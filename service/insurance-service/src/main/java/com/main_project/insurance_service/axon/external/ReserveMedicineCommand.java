package com.main_project.insurance_service.axon.external;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.axonframework.modelling.command.TargetAggregateIdentifier;

/**
 * External command để gửi đến Inventory Service
 * Đây là copy của ReserveMedicineCommand từ inventory-service
 */
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
    private String sagaId;
}


