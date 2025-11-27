package com.main_project.clinical_service.saga;


import com.do_an.common.command.AppointmentUpdateStatusCommand;
import com.do_an.common.event.AppointmentUpdateStatusEvent;
import com.do_an.common.command.MedicalHistoryCreateCommand;
import com.main_project.clinical_service.dto.MedicalServiceDTO;
import com.main_project.clinical_service.event.StartClinicalEvent;
import lombok.extern.slf4j.Slf4j;
import org.axonframework.commandhandling.gateway.CommandGateway;
import org.axonframework.modelling.saga.SagaEventHandler;
import org.axonframework.modelling.saga.SagaLifecycle;
import org.axonframework.modelling.saga.StartSaga;
import org.axonframework.spring.stereotype.Saga;
import org.springframework.beans.factory.annotation.Autowired;

import java.util.List;
import java.util.UUID;

@Saga
@Slf4j
public class ClinicalSaga {

    @Autowired
    private transient CommandGateway commandGateway;

    private UUID patientId;
    private UUID invoiceId;
    private UUID appointmentId;
    private UUID medicalHistoryId;
    private UUID doctorId;
    private UUID labTestId;
    private List<MedicalServiceDTO> medicalServices;
    private UUID clinicalId;

    @StartSaga
    @SagaEventHandler(associationProperty = "clinicalId")
    public void on(StartClinicalEvent event) {
        log.info("SAGA STARTED: starting clinical process", event.getClinicalId());
        log.info("Bat dau event", event.getAppointmentId());

        this.patientId = event.getPatientId();
        this.appointmentId = event.getAppointmentId();
        this.medicalServices = event.getMedicalServices();
        this.clinicalId = event.getClinicalId();

        SagaLifecycle.associateWith("appointmentId", String.valueOf(this.appointmentId));
        this.medicalHistoryId = UUID.randomUUID();

        commandGateway.send(new AppointmentUpdateStatusCommand(
                this.clinicalId,
                this.appointmentId,
                "PROGRESSING"
        ));

        commandGateway.send(new MedicalHistoryCreateCommand(
                this.clinicalId,
                this.appointmentId,
                this.patientId,
                this.medicalHistoryId
        ));

    }

    @SagaEventHandler(associationProperty = "clinicalId")
    public void on(AppointmentUpdateStatusEvent event) {
        log.info("Nhan du lieu tu appointment", event.getAppointmentId());

    }

}
