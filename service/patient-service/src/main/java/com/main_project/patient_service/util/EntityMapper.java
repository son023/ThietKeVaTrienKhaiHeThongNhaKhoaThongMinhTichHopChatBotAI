package com.main_project.patient_service.util;

import com.main_project.patient_service.dto.*;
import com.main_project.patient_service.entity.*;
import com.main_project.patient_service.enums.BloodType;
import com.main_project.patient_service.enums.Gender;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.stream.Collectors;

@Component
public class EntityMapper {

    public PatientResponseDTO toPatientResponse(Patient entity) {
        if (entity == null) return null;

        PatientResponseDTO dto = new PatientResponseDTO();
        dto.setUserId(entity.getUserId());
        dto.setDob(entity.getDob());
        dto.setGender(entity.getGender() != null ? entity.getGender().name() : null);
        dto.setAddress(entity.getAddress());
        dto.setContactPhone(entity.getContactPhone());
        dto.setBloodType(entity.getBloodType() != null ? entity.getBloodType().name() : null);
        dto.setInsuranceNumber(entity.getInsuranceNumber());
        dto.setPatientAllergies(mapPatientAllergiesToDTO(entity.getPatientAllergies()));
        dto.setUnderlyingDiseases(mapUnderlyingDiseasesToDTO(entity.getUnderlyingDiseases()));
        dto.setToothIssues(mapToothIssuesToDTO(entity.getToothIssues()));
        return dto;
    }

    public Patient toPatientEntity(PatientRequestDTO request) {
        if (request == null) return null;

        return Patient.builder()
                .userId(request.getUserId())
                .dob(request.getDob())
                .gender(Gender.fromString(request.getGender()))
                .address(request.getAddress())
                .contactPhone(request.getContactPhone())
                .bloodType(BloodType.fromString(request.getBloodType()))
                .insuranceNumber(request.getInsuranceNumber())
                .build();
    }

    public void updatePatientEntity(Patient entity, PatientRequestDTO request) {
        if (entity == null || request == null) return;

        entity.setDob(request.getDob());
        entity.setGender(Gender.fromString(request.getGender()));
        entity.setAddress(request.getAddress());
        entity.setContactPhone(request.getContactPhone());
        entity.setBloodType(BloodType.fromString(request.getBloodType()));
        entity.setInsuranceNumber(request.getInsuranceNumber());
    }

    public MedicalHistoryResponseDTO toMedicalHistoryResponse(MedicalHistory entity) {
        if (entity == null) return null;

        MedicalHistoryResponseDTO dto = new MedicalHistoryResponseDTO();
        dto.setId(entity.getId());
        dto.setAppointmentId(entity.getAppointmentId());
        dto.setSymptoms(entity.getSymptoms());
        dto.setTreatment(entity.getTreatment());
        dto.setDiagnosis(entity.getDiagnosis());
        dto.setDisease(entity.getDisease());
        dto.setCreatedAt(entity.getCreatedAt());
        dto.setUpdatedAt(entity.getUpdatedAt());

        if (entity.getPatient() != null) {
            dto.setPatientId(entity.getPatient().getUserId());
        }

        return dto;
    }

    public MedicalHistory toMedicalHistoryEntity(MedicalHistoryRequestDTO request, Patient patient) {
        if (request == null) return null;

        return MedicalHistory.builder()
                .appointmentId(request.getAppointmentId())
                .symptoms(request.getSymptoms())
                .treatment(request.getTreatment())
                .diagnosis(request.getDiagnosis())
                .disease(request.getDisease())
                .patient(patient)
                .build();
    }

    public void updateMedicalHistoryEntity(MedicalHistory entity, MedicalHistoryRequestDTO request, Patient patient) {
        if (entity == null || request == null) return;

        entity.setAppointmentId(request.getAppointmentId());
        entity.setSymptoms(request.getSymptoms());
        entity.setTreatment(request.getTreatment());
        entity.setDiagnosis(request.getDiagnosis());
        entity.setDisease(request.getDisease());
        entity.setPatient(patient);
    }

    private List<PatientAllergyDTO> mapPatientAllergiesToDTO(List<PatientAllergy> allergies) {
        if (allergies == null) return null;
        return allergies.stream()
                .map(pa -> PatientAllergyDTO.builder()
                        .allergyId(pa.getAllergy() != null ? pa.getAllergy().getId() : null)
                        .allergyName(pa.getAllergy() != null ? pa.getAllergy().getName() : null)
                        .severity(pa.getSeverity())
                        .reaction(pa.getReaction())
                        .note(pa.getNote())
                        .build())
                .collect(Collectors.toList());
    }

    private List<UnderlyingDiseaseDTO> mapUnderlyingDiseasesToDTO(List<UnderlyingDisease> diseases) {
        if (diseases == null) return null;
        return diseases.stream()
                .map(d -> UnderlyingDiseaseDTO.builder()
                        .name(d.getName())
                        .status(d.getStatus())
                        .severity(d.getSeverity())
                        .isVerified(d.getIsVerified())
                        .note(d.getNote())
                        .build())
                .collect(Collectors.toList());
    }

    private List<ToothIssueDTO> mapToothIssuesToDTO(List<ToothIssue> toothIssues) {
        if (toothIssues == null) return null;
        return toothIssues.stream()
                .map(t -> ToothIssueDTO.builder()
                        .toothNumber(t.getToothNumber())
                        .status(t.getStatus())
                        .description(t.getDescription())
                        .diagnosedDate(t.getDiagnosedDate())
                        .note(t.getNote())
                        .build())
                .collect(Collectors.toList());
    }
}
