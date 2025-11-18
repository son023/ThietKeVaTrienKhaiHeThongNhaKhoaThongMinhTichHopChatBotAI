package com.auth_service.auth_service.axon.event;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class MedicalTreatmentCompletedEvent {
    
    private String treatmentId;
    private String dispenseOrderId;
    private Instant timestamp;
}

