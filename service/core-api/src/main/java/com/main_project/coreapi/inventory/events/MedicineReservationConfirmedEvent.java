package com.main_project.coreapi.inventory.events;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class MedicineReservationConfirmedEvent {
    
    private String reservationId;
    private String dispenseOrderId;
    private Instant timestamp;
}

