package com.main_project.labtest_service.aggregate;

import org.axonframework.eventhandling.gateway.EventGateway;
import com.main_project.labtest_service.entity.LabTest;
import com.main_project.labtest_service.repository.LabTestRepository;
import com.main_project.labtest_service.repository.LabTestTypeRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.axonframework.eventhandling.EventHandler;
import org.springframework.stereotype.Component;

import java.time.ZonedDateTime;

@Component
@RequiredArgsConstructor
@Slf4j
public class LabTestEventHandler {

    private final LabTestRepository labTestRepository;
    private final LabTestTypeRepository labTestTypeRepository;
    private final EventGateway eventGateway;

    @EventHandler
    @Transactional
    public void on(LabTestRequestedEvent e) {
        LabTest entity = new LabTest();
        entity.setId(e.getLabTestId());
        entity.setAppointmentId(e.getAppointmentId());
        entity.setMedicalHistoryId(e.getMedicalHistoryId());
        entity.setDoctorId(e.getDoctorId());
        entity.setPrice(e.getPrice());
        entity.setInstructions(e.getInstructions());
        entity.setStatus("REQUEST");

        labTestTypeRepository.findById(e.getLabTestTypeId())
                .ifPresent(entity::setLabTestType);

        labTestRepository.save(entity);
    }

    @EventHandler
    @Transactional
    public void on(LabTestAcceptedEvent e) {
        labTestRepository.findById(e.getLabTestId())
                .ifPresent(lab -> {
                    lab.setStatus("ACCEPTED");
                    lab.setUpdatedAt(ZonedDateTime.now());
                });
    }

    @EventHandler
    @Transactional
    public void on(LabTestStartedEvent e) {
        labTestRepository.findById(e.getLabTestId())
                .ifPresent(lab -> {
                    lab.setStatus("IN_PROGRESS");
                    lab.setUpdatedAt(ZonedDateTime.now());
                });
    }

    @EventHandler
    @Transactional
    public void on(LabTestCompletedEvent e) {
        labTestRepository.findById(e.getLabTestId())
                .ifPresent(lab -> {
                    lab.setStatus("COMPLETE");
                    if (lab.getResultDate() == null) {
                        lab.setResultDate(ZonedDateTime.now());
                    }
                    lab.setUpdatedAt(ZonedDateTime.now());
                    labTestRepository.save(lab);
                });
    }
}