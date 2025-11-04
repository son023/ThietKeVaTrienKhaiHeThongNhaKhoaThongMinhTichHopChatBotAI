package com.main_project.insurance_service.service;

import com.main_project.insurance_service.dto.InsuranceClaimDTO;
import com.main_project.insurance_service.dto.InsuranceClaimRequestDTO;
import com.main_project.insurance_service.entity.InsuranceClaim;
import com.main_project.insurance_service.entity.PatientInsurance;
import com.main_project.insurance_service.repository.InsuranceClaimRepository;
import com.main_project.insurance_service.repository.PatientInsuranceRepository;
import com.main_project.insurance_service.util.EntityDTOMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.ZonedDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class InsuranceClaimService implements IInsuranceClaimService {

    private final InsuranceClaimRepository insuranceClaimRepository;
    private final PatientInsuranceRepository patientInsuranceRepository;
    private final EntityDTOMapper mapper;

    @Override
    @Transactional(readOnly = true)
    public List<InsuranceClaimDTO> getAllClaims() {
        return insuranceClaimRepository.findAll()
                .stream()
                .map(mapper::toInsuranceClaimDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<InsuranceClaimDTO> getClaimById(UUID id) {
        return insuranceClaimRepository.findById(id)
                .map(mapper::toInsuranceClaimDTO);
    }

    @Override
    @Transactional(readOnly = true)
    public List<InsuranceClaimDTO> getClaimsByStatus(String status) {
        return insuranceClaimRepository.findByStatus(status)
                .stream()
                .map(mapper::toInsuranceClaimDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<InsuranceClaimDTO> getClaimsByPatientInsuranceId(UUID patientInsuranceId) {
        return insuranceClaimRepository.findByPatientInsuranceId(patientInsuranceId)
                .stream()
                .map(mapper::toInsuranceClaimDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<InsuranceClaimDTO> getClaimsByPatientId(UUID patientId) {
        return insuranceClaimRepository.findByPatientId(patientId)
                .stream()
                .map(mapper::toInsuranceClaimDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<InsuranceClaimDTO> getClaimsByDateRange(ZonedDateTime startDate, ZonedDateTime endDate) {
        return insuranceClaimRepository.findByClaimDateBetween(startDate, endDate)
                .stream()
                .map(mapper::toInsuranceClaimDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<InsuranceClaimDTO> getClaimsByStatusAndMinAmount(String status, Integer minAmount) {
        return insuranceClaimRepository.findByStatusAndClaimAmountGreaterThanEqual(status, minAmount)
                .stream()
                .map(mapper::toInsuranceClaimDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public long getClaimCountByPatientInsurance(UUID patientInsuranceId) {
        return insuranceClaimRepository.countByPatientInsuranceId(patientInsuranceId);
    }

    @Override
    @Transactional(readOnly = true)
    public Integer getTotalApprovedAmountByPatientInsurance(UUID patientInsuranceId) {
        Integer total = insuranceClaimRepository.getTotalApprovedAmountByPatientInsurance(patientInsuranceId);
        return total != null ? total : 0;
    }

    @Override
    public InsuranceClaimDTO createClaim(InsuranceClaimRequestDTO requestDTO) {
        PatientInsurance patientInsurance = patientInsuranceRepository.findById(requestDTO.getPatientInsuranceId())
                .orElseThrow(() -> new RuntimeException("Patient insurance not found with id: " + requestDTO.getPatientInsuranceId()));

        InsuranceClaim entity = mapper.toInsuranceClaimEntity(requestDTO, patientInsurance);
        InsuranceClaim savedEntity = insuranceClaimRepository.save(entity);
        return mapper.toInsuranceClaimDTO(savedEntity);
    }

    @Override
    public InsuranceClaimDTO updateClaim(UUID id, InsuranceClaimRequestDTO requestDTO) {
        InsuranceClaim existingEntity = insuranceClaimRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Insurance claim not found with id: " + id));

        PatientInsurance patientInsurance = patientInsuranceRepository.findById(requestDTO.getPatientInsuranceId())
                .orElseThrow(() -> new RuntimeException("Patient insurance not found with id: " + requestDTO.getPatientInsuranceId()));

        mapper.updateInsuranceClaimEntity(existingEntity, requestDTO, patientInsurance);
        InsuranceClaim updatedEntity = insuranceClaimRepository.save(existingEntity);
        return mapper.toInsuranceClaimDTO(updatedEntity);
    }

    @Override
    public InsuranceClaimDTO approveClaim(UUID id, Integer approvedAmount) {
        InsuranceClaim existingEntity = insuranceClaimRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Insurance claim not found with id: " + id));

        existingEntity.setStatus("APPROVED");
        existingEntity.setApprovedAmount(approvedAmount);
        existingEntity.setApprovalDate(ZonedDateTime.now());

        InsuranceClaim updatedEntity = insuranceClaimRepository.save(existingEntity);
        return mapper.toInsuranceClaimDTO(updatedEntity);
    }

    @Override
    public InsuranceClaimDTO rejectClaim(UUID id, String reason) {
        InsuranceClaim existingEntity = insuranceClaimRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Insurance claim not found with id: " + id));

        existingEntity.setStatus("REJECTED");
        existingEntity.setApprovedAmount(0);
        existingEntity.setApprovalDate(ZonedDateTime.now());
        existingEntity.setNotes(existingEntity.getNotes() + (existingEntity.getNotes() != null ? " | " : "") + "Reject reason: " + reason);

        InsuranceClaim updatedEntity = insuranceClaimRepository.save(existingEntity);
        return mapper.toInsuranceClaimDTO(updatedEntity);
    }

    @Override
    public void deleteClaim(UUID id) {
        if (!insuranceClaimRepository.existsById(id)) {
            throw new RuntimeException("Insurance claim not found with id: " + id);
        }
        insuranceClaimRepository.deleteById(id);
    }
}





