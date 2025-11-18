package com.main_project.coreapi.insurance.events;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class MedicalClaimCancelledEvent {
    
    private String claimId;
    private String cancellationReason;
    private Instant timestamp;
}

