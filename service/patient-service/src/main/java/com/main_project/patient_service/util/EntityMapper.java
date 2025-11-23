package com.main_project.patient_service.util;

import com.main_project.patient_service.dto.MedicalHistoryRequestDTO;
import com.main_project.patient_service.dto.MedicalHistoryResponseDTO;
import com.main_project.patient_service.dto.PatientRequestDTO;
import com.main_project.patient_service.dto.PatientResponseDTO;
import com.main_project.patient_service.entity.MedicalHistory;
import com.main_project.patient_service.entity.Patient;
import org.springframework.stereotype.Component;

@Component
public class EntityMapper {

    public PatientResponseDTO toPatientResponse(Patient entity) {
        if (entity == null) return null;

        PatientResponseDTO dto = new PatientResponseDTO();
        dto.setUserId(entity.getUserId());
        dto.setDob(entity.getDob());
        dto.setGender(entity.getGender());
        dto.setAddress(entity.getAddress());
        dto.setContactPhone(entity.getContactPhone());
        dto.setBloodType(entity.getBloodType());
        dto.setAllergy(entity.getAllergy());
        dto.setInsuranceNumber(entity.getInsuranceNumber());
        return dto;
    }

    public Patient toPatientEntity(PatientRequestDTO request) {
        if (request == null) return null;

        return Patient.builder()
                .userId(request.getUserId())
                .dob(request.getDob())
                .gender(request.getGender())
                .address(request.getAddress())
                .contactPhone(request.getContactPhone())
                .bloodType(request.getBloodType())
                .allergy(request.getAllergy())
                .insuranceNumber(request.getInsuranceNumber())
                .build();
    }

    public void updatePatientEntity(Patient entity, PatientRequestDTO request) {
        if (entity == null || request == null) return;

        entity.setDob(request.getDob());
        entity.setGender(request.getGender());
        entity.setAddress(request.getAddress());
        entity.setContactPhone(request.getContactPhone());
        entity.setBloodType(request.getBloodType());
        entity.setAllergy(request.getAllergy());
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
}
