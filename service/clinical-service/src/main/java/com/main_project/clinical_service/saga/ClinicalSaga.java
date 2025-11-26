package com.main_project.clinical_service.saga;


import com.do_an.common.command.ReserveMedicineCommand;
import com.do_an.common.event.PrescriptionCreatedEvent;
import lombok.extern.slf4j.Slf4j;
import org.axonframework.commandhandling.gateway.CommandGateway;
import org.axonframework.modelling.saga.SagaEventHandler;
import org.axonframework.modelling.saga.SagaLifecycle;
import org.axonframework.modelling.saga.StartSaga;
import org.axonframework.spring.stereotype.Saga;
import org.springframework.beans.factory.annotation.Autowired;

import java.util.UUID;

@Saga
@Slf4j
public class ClinicalSaga {

    @Autowired
    private transient CommandGateway commandGateway;

    private UUID patientId;
    private UUID invoiceId;
    private UUID appointmentId;
    private UUID doctorId;
    private UUID labTestId;

    @StartSaga
    @SagaEventHandler(associationProperty = "clinicalId")
    public void on(PrescriptionCreatedEvent event) {
        log.info("🚀 SAGA STARTED: Prescription {} created, starting billing process", event.getPrescriptionId());

        this.patientId = event.getPatientId();
        this.medicineItems = event.getItems();

        // TODO: Từ medicalHistoryId trong request có appointmentId, sau đó tìm kiếm appointmentId trong invoice
        // Labtest.getMedicalHistory(event.getMedicalHistoryId())-->MedicalHistory.getAppointmentId()
        // Invoice.getInvoice(MedicalHistory.getAppointmentId())-->Invoice()
        // Tạm thời hardcode, cần implement logic tìm invoiceId từ medicalHistoryId
        this.invoiceId = UUID.fromString("3fa85f64-5717-4562-b3fc-2c963f66afa6");

        SagaLifecycle.associateWith("invoiceId", String.valueOf(this.invoiceId));
        this.dispenseOrderId = UUID.randomUUID();

        log.info("📦 STEP 1: Sending ReserveMedicineCommand for prescription {}", event.getPrescriptionId());

        // Gửi command - Axon sẽ tự động xử lý exception thông qua events
        commandGateway.send(new ReserveMedicineCommand(
                this.dispenseOrderId,
                event.getPrescriptionId(),
                event.getItems()
        ));
    }

}
