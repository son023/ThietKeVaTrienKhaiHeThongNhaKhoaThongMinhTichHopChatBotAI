package com.main_project.insurance_service.axon.event;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.Instant;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class MedicalClaimApprovedEvent {
    
    private String claimId;
    private BigDecimal approvedAmount;
    private String approvalNotes;
    private Instant approvedAt;
}


