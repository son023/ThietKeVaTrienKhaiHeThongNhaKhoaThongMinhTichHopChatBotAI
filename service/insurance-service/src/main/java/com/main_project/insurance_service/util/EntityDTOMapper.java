package com.main_project.insurance_service.util;

import com.main_project.insurance_service.dto.*;
import com.main_project.insurance_service.entity.*;
import org.springframework.stereotype.Component;

@Component
public class EntityDTOMapper {

    // Insurance Policy Mappings
    public InsurancePolicyDTO toInsurancePolicyDTO(InsurancePolicy entity) {
        if (entity == null) return null;
        
        InsurancePolicyDTO dto = new InsurancePolicyDTO();
        dto.setId(entity.getId());
        dto.setPolicyNumber(entity.getPolicyNumber());
        dto.setPolicyType(entity.getPolicyType());
        dto.setCoverageAmount(entity.getCoverageAmount());
        dto.setDeductible(entity.getDeductible());
        dto.setStartDate(entity.getStartDate());
        dto.setEndDate(entity.getEndDate());
        dto.setStatus(entity.getStatus());
        dto.setCreateAt(entity.getCreateAt());
        dto.setUpdateAt(entity.getUpdateAt());
        return dto;
    }

    public InsurancePolicy toInsurancePolicyEntity(InsurancePolicyRequestDTO requestDTO) {
        if (requestDTO == null) return null;
        
        InsurancePolicy entity = new InsurancePolicy();
        entity.setPolicyNumber(requestDTO.getPolicyNumber());
        entity.setPolicyType(requestDTO.getPolicyType());
        entity.setCoverageAmount(requestDTO.getCoverageAmount());
        entity.setDeductible(requestDTO.getDeductible());
        entity.setStartDate(requestDTO.getStartDate());
        entity.setEndDate(requestDTO.getEndDate());
        entity.setStatus(requestDTO.getStatus());
        return entity;
    }

    public void updateInsurancePolicyEntity(InsurancePolicy entity, InsurancePolicyRequestDTO requestDTO) {
        if (entity == null || requestDTO == null) return;
        
        entity.setPolicyNumber(requestDTO.getPolicyNumber());
        entity.setPolicyType(requestDTO.getPolicyType());
        entity.setCoverageAmount(requestDTO.getCoverageAmount());
        entity.setDeductible(requestDTO.getDeductible());
        entity.setStartDate(requestDTO.getStartDate());
        entity.setEndDate(requestDTO.getEndDate());
        entity.setStatus(requestDTO.getStatus());
    }

    // Patient Insurance Mappings
    public PatientInsuranceDTO toPatientInsuranceDTO(PatientInsurance entity) {
        if (entity == null) return null;
        
        PatientInsuranceDTO dto = new PatientInsuranceDTO();
        dto.setId(entity.getId());
        dto.setPatientId(entity.getPatientId());
        dto.setIssueDate(entity.getIssueDate());
        dto.setExpiryDate(entity.getExpiryDate());
        dto.setStatus(entity.getStatus());
        dto.setCreateAt(entity.getCreateAt());
        dto.setUpdateAt(entity.getUpdateAt());
        
        if (entity.getInsurancePolicy() != null) {
            dto.setInsurancePolicyId(entity.getInsurancePolicy().getId());
            dto.setInsurancePolicy(toInsurancePolicyDTO(entity.getInsurancePolicy()));
        }
        
        return dto;
    }

    public PatientInsurance toPatientInsuranceEntity(PatientInsuranceRequestDTO requestDTO, InsurancePolicy insurancePolicy) {
        if (requestDTO == null) return null;
        
        PatientInsurance entity = new PatientInsurance();
        entity.setPatientId(requestDTO.getPatientId());
        entity.setIssueDate(requestDTO.getIssueDate());
        entity.setExpiryDate(requestDTO.getExpiryDate());
        entity.setStatus(requestDTO.getStatus());
        entity.setInsurancePolicy(insurancePolicy);
        return entity;
    }

    public void updatePatientInsuranceEntity(PatientInsurance entity, PatientInsuranceRequestDTO requestDTO, InsurancePolicy insurancePolicy) {
        if (entity == null || requestDTO == null) return;
        
        entity.setPatientId(requestDTO.getPatientId());
        entity.setIssueDate(requestDTO.getIssueDate());
        entity.setExpiryDate(requestDTO.getExpiryDate());
        entity.setStatus(requestDTO.getStatus());
        entity.setInsurancePolicy(insurancePolicy);
    }

    // Insurance Claim Mappings
    public InsuranceClaimDTO toInsuranceClaimDTO(InsuranceClaim entity) {
        if (entity == null) return null;
        
        InsuranceClaimDTO dto = new InsuranceClaimDTO();
        dto.setId(entity.getId());
        dto.setClaimAmount(entity.getClaimAmount());
        dto.setApprovedAmount(entity.getApprovedAmount());
        dto.setStatus(entity.getStatus());
        dto.setClaimDate(entity.getClaimDate());
        dto.setApprovalDate(entity.getApprovalDate());
        dto.setNotes(entity.getNotes());
        dto.setCreateAt(entity.getCreateAt());
        dto.setUpdateAt(entity.getUpdateAt());
        
        if (entity.getPatientInsurance() != null) {
            dto.setPatientInsuranceId(entity.getPatientInsurance().getId());
            dto.setPatientInsurance(toPatientInsuranceDTO(entity.getPatientInsurance()));
        }
        
        return dto;
    }

    public InsuranceClaim toInsuranceClaimEntity(InsuranceClaimRequestDTO requestDTO, PatientInsurance patientInsurance) {
        if (requestDTO == null) return null;
        
        InsuranceClaim entity = new InsuranceClaim();
        entity.setClaimAmount(requestDTO.getClaimAmount());
        entity.setApprovedAmount(requestDTO.getApprovedAmount());
        entity.setStatus(requestDTO.getStatus());
        entity.setClaimDate(requestDTO.getClaimDate());
        entity.setApprovalDate(requestDTO.getApprovalDate());
        entity.setNotes(requestDTO.getNotes());
        entity.setPatientInsurance(patientInsurance);
        return entity;
    }

    public void updateInsuranceClaimEntity(InsuranceClaim entity, InsuranceClaimRequestDTO requestDTO, PatientInsurance patientInsurance) {
        if (entity == null || requestDTO == null) return;
        
        entity.setClaimAmount(requestDTO.getClaimAmount());
        entity.setApprovedAmount(requestDTO.getApprovedAmount());
        entity.setStatus(requestDTO.getStatus());
        entity.setClaimDate(requestDTO.getClaimDate());
        entity.setApprovalDate(requestDTO.getApprovalDate());
        entity.setNotes(requestDTO.getNotes());
        entity.setPatientInsurance(patientInsurance);
    }

    // Claim Document Mappings
    public ClaimDocumentDTO toClaimDocumentDTO(ClaimDocument entity) {
        if (entity == null) return null;
        
        ClaimDocumentDTO dto = new ClaimDocumentDTO();
        dto.setId(entity.getId());
        dto.setFilePath(entity.getFilePath());
        dto.setDocumentType(entity.getDocumentType());
        dto.setStatus(entity.getStatus());
        dto.setUploadAt(entity.getUploadAt());
        
        if (entity.getInsuranceClaim() != null) {
            dto.setInsuranceClaimId(entity.getInsuranceClaim().getId());
            dto.setInsuranceClaim(toInsuranceClaimDTO(entity.getInsuranceClaim()));
        }
        
        return dto;
    }

    public ClaimDocument toClaimDocumentEntity(ClaimDocumentRequestDTO requestDTO, InsuranceClaim insuranceClaim) {
        if (requestDTO == null) return null;
        
        ClaimDocument entity = new ClaimDocument();
        entity.setFilePath(requestDTO.getFilePath());
        entity.setDocumentType(requestDTO.getDocumentType());
        entity.setStatus(requestDTO.getStatus());
        entity.setUploadAt(requestDTO.getUploadAt());
        entity.setInsuranceClaim(insuranceClaim);
        return entity;
    }

    public void updateClaimDocumentEntity(ClaimDocument entity, ClaimDocumentRequestDTO requestDTO, InsuranceClaim insuranceClaim) {
        if (entity == null || requestDTO == null) return;
        
        entity.setFilePath(requestDTO.getFilePath());
        entity.setDocumentType(requestDTO.getDocumentType());
        entity.setStatus(requestDTO.getStatus());
        entity.setUploadAt(requestDTO.getUploadAt());
        entity.setInsuranceClaim(insuranceClaim);
    }
}








