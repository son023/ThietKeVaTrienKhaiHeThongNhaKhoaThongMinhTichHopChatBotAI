package com.main_project.insurance_service.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.ZonedDateTime;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PatientInsuranceDTO {
    private UUID id;
    private UUID patientId;
    private LocalDate issueDate;
    private LocalDate expiryDate;
    private String status;
    private ZonedDateTime createAt;
    private ZonedDateTime updateAt;
    private UUID insurancePolicyId;
    private InsurancePolicyDTO insurancePolicy;
}








