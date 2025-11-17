package com.main_project.inventory_service.axon.event;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class MedicineReservationFailedEvent {
    
    private String reservationId;
    private String medicineId;
    private Integer requestedQuantity;
    private String failureReason;
    private String sagaId;
    private Instant failedAt;
}


