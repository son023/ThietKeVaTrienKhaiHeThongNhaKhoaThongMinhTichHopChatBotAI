package com.main_project.insurance_service.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.ZonedDateTime;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ClaimDocumentDTO {
    private UUID id;
    private String filePath;
    private String documentType;
    private String status;
    private ZonedDateTime uploadAt;
    private UUID insuranceClaimId;
    private InsuranceClaimDTO insuranceClaim;
}








