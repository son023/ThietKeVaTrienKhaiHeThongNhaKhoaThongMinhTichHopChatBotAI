package com.main_project.patient_service.aggregate;

import com.do_an.common.event.MedicalHistoryPersistedEvent;
import com.main_project.patient_service.entity.MedicalHistory;
import com.main_project.patient_service.entity.Patient;
import com.main_project.patient_service.repository.MedicalHistoryRepository;
import com.main_project.patient_service.repository.PatientRepository;
import jakarta.persistence.EntityNotFoundException;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.axonframework.eventhandling.EventBus;
import org.axonframework.eventhandling.EventHandler;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class MedicalHistoryEventHandler {
    private final MedicalHistoryRepository medicalHistoryRepository;
    private final PatientRepository patientRepository;
    private final EventBus eventBus;


    @EventHandler
    @Transactional
    public void on(MedicalHistoryCreatedEvent event) {
        Patient patient = patientRepository.findById(event.getPatientId())
                .orElseThrow(() -> new EntityNotFoundException("Patient not found for user " + event.getPatientId()));

        MedicalHistory medicalHistory = MedicalHistory.builder()
                .id(event.getMedicalHistoryId())
                .appointmentId(event.getAppointmentId())
                .patient(patient)
                .build();

        medicalHistoryRepository.save(medicalHistory);

        eventBus.publish(org.axonframework.eventhandling.GenericEventMessage.asEventMessage(
                new MedicalHistoryPersistedEvent(
                        event.getClinicalId(),
                        event.getAppointmentId(),
                        event.getPatientId(),
                        event.getMedicalHistoryId()
                )
        ));

        log.info("MedicalHistory persisted and event published for medicalHistoryId {}", event.getMedicalHistoryId());
    }
}