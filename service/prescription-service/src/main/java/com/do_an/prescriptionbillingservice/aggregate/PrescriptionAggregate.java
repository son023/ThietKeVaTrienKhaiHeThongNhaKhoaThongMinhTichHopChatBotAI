package com.do_an.prescriptionbillingservice.aggregate;

import com.do_an.common.command.CreatePrescriptionCommand;
import com.do_an.common.event.PrescriptionCreatedEvent;
import com.do_an.common.model.MedicineItem;
import lombok.NoArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.axonframework.commandhandling.CommandHandler;
import org.axonframework.eventsourcing.EventSourcingHandler;
import org.axonframework.modelling.command.AggregateIdentifier;
import org.axonframework.modelling.command.AggregateLifecycle;
import org.axonframework.spring.stereotype.Aggregate;

import java.util.List;
import java.util.UUID;

@Aggregate
@NoArgsConstructor
@Slf4j
public class PrescriptionAggregate {
    @AggregateIdentifier
    private UUID prescriptionId;
    private String status;
    private UUID invoiceId;
    private UUID patientId;
    private UUID doctorId;
    private UUID medicalHistoryId;

    // ✅ Constructor với idempotency guard
    public PrescriptionAggregate(UUID prescriptionId, UUID invoiceId, UUID patientId, UUID doctorId, UUID medicalHistoryId, List<MedicineItem> items) {
        // ⚠️ CRITICAL GUARD: Aggregate đã được tạo rồi, từ chối duplicate creation
        if (this.status != null && "CREATED".equals(this.status)) {
            log.warn("⚠️ [AGGREGATE GUARD] PrescriptionAggregate {} already CREATED, rejecting duplicate command", prescriptionId);
            return; // Không apply event, giữ nguyên state
        }

        log.info("✅ [AGGREGATE] Creating PrescriptionAggregate: prescriptionId={}", prescriptionId);
        
        // Apply event chỉ khi chưa được tạo
        AggregateLifecycle.apply(new PrescriptionCreatedEvent(
                prescriptionId,
                invoiceId,
                patientId,
                doctorId,
                medicalHistoryId,
                items
        ));
    }

    @EventSourcingHandler
    public void on(PrescriptionCreatedEvent event) {
        log.info("📝 [EVENT SOURCING] Applying PrescriptionCreatedEvent: prescriptionId={}", event.getPrescriptionId());
        this.prescriptionId = event.getPrescriptionId();
        this.invoiceId = event.getInvoiceId();
        this.patientId = event.getPatientId();
        this.doctorId = event.getDoctorId();
        this.medicalHistoryId = event.getMedicalHistoryId();
        this.status = "CREATED";
    }

    // ✅ HELPER: Kiểm tra xem aggregate đã được khởi tạo chưa
    private boolean isCreated() {
        return this.status != null && "CREATED".equals(this.status);
    }

}
