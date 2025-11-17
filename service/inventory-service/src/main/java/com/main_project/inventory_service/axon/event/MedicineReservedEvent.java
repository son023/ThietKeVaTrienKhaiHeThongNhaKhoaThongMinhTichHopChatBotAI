package com.main_project.inventory_service.axon.event;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class MedicineReservedEvent {
    
    private String reservationId;
    private String medicineId;
    private Integer quantity;
    private String patientId;
    private String claimId;
    private String sagaId;
    private Instant reservedAt;
}


