package com.main_project.inventory_service.axon.event;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class MedicineReservationCancelledEvent {
    
    private String reservationId;
    private String cancellationReason;
    private Instant cancelledAt;
}


