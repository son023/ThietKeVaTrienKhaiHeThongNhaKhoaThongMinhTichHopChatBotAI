package com.main_project.insurance_service.axon.external;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

/**
 * External event từ Inventory Service
 */
@Data
@AllArgsConstructor
@NoArgsConstructor
public class MedicineReservationCancelledEvent {
    
    private String reservationId;
    private String cancellationReason;
    private Instant cancelledAt;
}


