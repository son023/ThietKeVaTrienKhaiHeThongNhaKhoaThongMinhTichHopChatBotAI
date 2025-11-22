package com.main_project.insurance_service.dto;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.ZonedDateTime;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class InsuranceClaimRequestDTO {
    
    @NotNull(message = "Status is required")
    private String status;
    
    private Integer patientPayAmount;
    
    private Integer totalClaimAmount;
    
    private Integer totalInsurancePay;
    
    @NotNull(message = "Claim date is required")
    private ZonedDateTime claimDate;
    
    private ZonedDateTime approvalDate;
    
    private String notes;
    
    @NotNull(message = "Patient insurance ID is required")
    private UUID patientInsuranceId;
}





