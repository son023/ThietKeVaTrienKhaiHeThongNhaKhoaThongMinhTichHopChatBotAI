package com.main_project.insurance_service.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.ZonedDateTime;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class InsuranceClaimDTO {
    private UUID id;
    private String status;
    private Integer claimAmount;
    private Integer approvedAmount;
    private Integer patientPayAmount;
    private Integer totalClaimAmount;
    private Integer totalInsurancePay;
    private ZonedDateTime claimDate;
    private ZonedDateTime approvalDate;
    private String notes;
    private ZonedDateTime createAt;
    private ZonedDateTime updateAt;
    private UUID patientInsuranceId;
    private PatientInsuranceDTO patientInsurance;
}





