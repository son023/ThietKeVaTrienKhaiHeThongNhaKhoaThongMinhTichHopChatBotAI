package com.main_project.clinical_service.saga;

import com.do_an.common.command.CreateInvoiceCommand;
import com.do_an.common.command.CreateMedicalHistoryCommand;
import com.do_an.common.event.AppointmentStartedEvent;
import com.do_an.common.event.InvoicePersistedEvent;
import com.do_an.common.event.MedicalHistoryPersistedEvent;
import com.do_an.common.model.MedicalServiceDTO;
import lombok.extern.slf4j.Slf4j;
import org.axonframework.commandhandling.gateway.CommandGateway;
import org.axonframework.modelling.saga.SagaEventHandler;
import org.axonframework.modelling.saga.SagaLifecycle;
import org.axonframework.modelling.saga.StartSaga;
import org.axonframework.spring.stereotype.Saga;
import org.springframework.beans.factory.annotation.Autowired;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Saga
@Slf4j
public class ConsultationSaga {

    @Autowired
    private transient CommandGateway commandGateway;

    private UUID patientId;
    private UUID invoiceId;
    private UUID appointmentId;
    private UUID medicalHistoryId;
    private UUID doctorId;
    private List<MedicalServiceDTO> medicalServices;
    private UUID clinicalId;
    private String sagaStatus;

    @StartSaga
    @SagaEventHandler(associationProperty = "clinicalId")
    public void on(AppointmentStartedEvent event) {
        log.info("ConsultationSaga started for appointment {}", event.getAppointmentId());

        this.patientId = event.getPatientId();
        this.appointmentId = event.getAppointmentId();
        this.medicalServices = new ArrayList<>(event.getMedicalServices() == null ? List.of() : event.getMedicalServices());
        this.clinicalId = event.getClinicalId();
        this.doctorId = event.getDoctorId();
        this.medicalHistoryId = UUID.randomUUID();
        this.invoiceId = UUID.randomUUID();
        this.sagaStatus = "MedicalHistoryPending";

        SagaLifecycle.associateWith("appointmentId", event.getAppointmentId().toString());
        SagaLifecycle.associateWith("clinicalId", event.getClinicalId().toString());
        log.info("Dispatching CreateMedicalHistoryCommand clinicalId={}, medicalHistoryId={}", this.clinicalId, this.medicalHistoryId);

        CreateMedicalHistoryCommand command = new CreateMedicalHistoryCommand(
                this.clinicalId,
                this.appointmentId,
                this.patientId,
                this.medicalHistoryId
        );

        commandGateway.send(command)
                .whenComplete((result, error) -> {
                    if (error != null) {
                        log.error("CreateMedicalHistoryCommand failed clinicalId={}, appointmentId={}: {}", this.clinicalId, this.appointmentId, error.getMessage(), error);
                    } else {
                        log.info("CreateMedicalHistoryCommand dispatched successfully for appointment {}", this.appointmentId);
                    }
                });

    }

    @SagaEventHandler(associationProperty = "clinicalId")
    public void on(MedicalHistoryPersistedEvent event) {
        this.medicalHistoryId = event.getMedicalHistoryId();
        this.sagaStatus = "InvoicePending";
        log.info("Medical history {} created, saga status -> {}", this.medicalHistoryId, this.sagaStatus);

        log.info("Dispatching CreateInvoiceCommand clinicalId={}, appointmentId={}", this.clinicalId, this.appointmentId);
        CreateInvoiceCommand command = new CreateInvoiceCommand(
                this.clinicalId,
                this.invoiceId,
                this.appointmentId,
                this.patientId,
                this.medicalHistoryId,
                this.doctorId,
                this.medicalServices
        );

        commandGateway.send(command)
                .whenComplete((result, error) -> {
                    if (error != null) {
                        log.error("CreateInvoiceCommand failed clinicalId={}, appointmentId={}: {}", this.clinicalId, this.appointmentId, error.getMessage(), error);
                    } else {
                        log.info("CreateInvoiceCommand dispatched successfully for appointment {}", this.appointmentId);
                    }
                });
    }

    @SagaEventHandler(associationProperty = "clinicalId")
    public void on(InvoicePersistedEvent event) {
        this.invoiceId = event.getInvoiceId();
        this.sagaStatus = "ExaminationStarted";
        log.info("Invoice {} created for appointment {}, saga status -> {}", this.invoiceId, event.getAppointmentId(), this.sagaStatus);
    }
}