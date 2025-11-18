package com.auth_service.auth_service.axon.event;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class MedicalTreatmentFailedEvent {
    
    private String treatmentId;
    private String failureReason;
    private Instant timestamp;
}

