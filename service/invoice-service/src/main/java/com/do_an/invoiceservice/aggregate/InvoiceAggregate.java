package com.do_an.invoiceservice.aggregate;


import com.do_an.common.command.RemoveMedicineChargesCommand;
import com.do_an.common.command.RevertInsuranceDiscountCommand;
import com.do_an.common.event.*;
import com.do_an.common.model.InvoiceCheckerRequest;
import com.do_an.common.model.InvoiceItemResponse;
import com.do_an.common.model.MedicalServiceDTO;
import com.do_an.common.model.MedicineItem;
import lombok.NoArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.axonframework.commandhandling.CommandHandler;
import org.axonframework.eventsourcing.EventSourcingHandler;
import org.axonframework.modelling.command.AggregateIdentifier;
import org.axonframework.modelling.command.AggregateLifecycle;
import org.axonframework.spring.stereotype.Aggregate;

import java.util.List;
import java.util.Set;
import java.util.UUID;


@Aggregate
@NoArgsConstructor
@Slf4j
public class InvoiceAggregate {

   @AggregateIdentifier
   private UUID invoiceId;

    // Trạng thái nội tại để validation và guard
    private UUID prescriptionId;
    private UUID insuranceClaimId;
    private boolean medicineChargesAdded;
    private boolean insuranceApplied;
    private String status; // "CREATED", "PENDING", "PAID", "CANCELLED"

    // ✅ Constructor 1: Tạo invoice ban đầu
    public InvoiceAggregate(UUID clinicalId, UUID invoiceId, UUID appointmentId, UUID patientId, UUID medicalHistoryId, UUID doctorId, List<MedicalServiceDTO> medicalServices) {
        // ⚠️ GUARD: Aggregate đã được tạo rồi
        if (this.status != null && "CREATED".equals(this.status)) {
            log.warn("⚠️ [AGGREGATE GUARD] InvoiceAggregate {} already CREATED, rejecting duplicate", invoiceId);
            return;
        }

        log.info("✅ [AGGREGATE] Creating InvoiceAggregate: invoiceId={}", invoiceId);
        
        AggregateLifecycle.apply(new InvoiceCreateEvent(
                clinicalId,
                invoiceId,
                appointmentId,
                patientId,
                medicalHistoryId,
                doctorId,
                medicalServices
        ));
    }

    // ✅ Constructor 2: Thêm medicine charges (deprecated - prefer method)
    public InvoiceAggregate(UUID prescriptionId, UUID invoiceId,
                            List<MedicineItem> medicineItems,
                            InvoiceCheckerRequest invoiceCheckerRequest) {
        log.warn("⚠️ [AGGREGATE] Using deprecated constructor for medicine charges");
        addMedicineCharges(prescriptionId, invoiceId, medicineItems, invoiceCheckerRequest);
    }

    // ✅ Method: Thêm medicine charges với guard
    public void addMedicineCharges(UUID prescriptionId, UUID invoiceId,
                                   List<MedicineItem> medicineItems,
                                   InvoiceCheckerRequest invoiceCheckerRequest) {
        // ⚠️ GUARD: Medicine charges đã được thêm rồi
//        if (this.medicineChargesAdded) {
//            log.warn("⚠️ [AGGREGATE GUARD] Medicine charges already added to invoice {}, rejecting duplicate",
//                    invoiceId);
//            return;
//        }
//
//        log.info("✅ [AGGREGATE] Adding medicine charges to invoice: {}", invoiceId);
        
        AggregateLifecycle.apply(new MedicineChargesAddedEvent(
                prescriptionId,
                invoiceId,
                medicineItems,
                invoiceCheckerRequest
        ));
    }

    // ✅ Method: Apply insurance discount với guard
    public void applyInsuranceDiscount(UUID insuranceClaimId, UUID prescriptionId, UUID invoiceId, Integer discountAmount, Set<InvoiceItemResponse> items) {
        // ⚠️ GUARD: Insurance đã được apply rồi
//        if (this.insuranceApplied) {
//            log.warn("⚠️ [AGGREGATE GUARD] Insurance already applied to invoice {}, rejecting duplicate",
//                    invoiceId);
//            return;
//        }
//
//        log.info("✅ [AGGREGATE] Applying insurance discount to invoice: {}, amount={}", invoiceId, discountAmount);
        
        AggregateLifecycle.apply(new InsuranceDiscountUpdatedEvent(
                insuranceClaimId,
                prescriptionId,
                invoiceId,
                discountAmount,
                items
        ));
    }

    // ✅ Method: Mark invoice as paid với guard
    public void applyInvoicePaid(UUID invoiceId){
        // ⚠️ GUARD: Invoice đã PAID rồi
//        if ("PAID".equals(this.status)) {
//            log.warn("⚠️ [AGGREGATE GUARD] Invoice {} already PAID, rejecting duplicate", invoiceId);
//            return;
//        }
//
//        log.info("✅ [AGGREGATE] Marking invoice as PAID: {}", invoiceId);
        
        AggregateLifecycle.apply(new InvoicePaidEvent(invoiceId));
    }

    // ✅ Method: Cancel invoice với guard
    public void applyCancelInvoice(UUID invoiceId, String reason){
        // ⚠️ GUARD: Invoice đã CANCELLED hoặc PAID rồi
//        if ("CANCELLED".equals(this.status)) {
//            log.warn("⚠️ [AGGREGATE GUARD] Invoice {} already CANCELLED, rejecting duplicate", invoiceId);
//            return;
//        }
//
//        if ("PAID".equals(this.status)) {
//            log.warn("⚠️ [AGGREGATE GUARD] Cannot cancel invoice {} - already PAID", invoiceId);
//            return;
//        }
//
//        log.info("✅ [AGGREGATE] Cancelling invoice: {}, reason={}", invoiceId, reason);
        
        UUID insuranceClaimId = this.insuranceApplied ? this.insuranceClaimId : null;

        AggregateLifecycle.apply(new InvoiceCancelledEvent(
                invoiceId,
                this.prescriptionId,
                insuranceClaimId,
                reason
        ));
    }


   @CommandHandler
   public void handle(RevertInsuranceDiscountCommand command) {
       // ⚠️ GUARD: Chỉ revert nếu insurance đã được apply
//       if (!this.insuranceApplied) {
//           log.warn("⚠️ [AGGREGATE GUARD] Cannot revert insurance discount - not applied yet for invoice {}",
//                   command.getInvoiceId());
//           return;
//       }
//
//       log.info("✅ [AGGREGATE] Reverting insurance discount for invoice: {}", command.getInvoiceId());
       
       AggregateLifecycle.apply(new InsuranceDiscountRevertedEvent(
               command.getPrescriptionId(),
               command.getInvoiceId()
       ));
   }

   @CommandHandler
   public void handle(RemoveMedicineChargesCommand command) {
       // ⚠️ GUARD: Chỉ remove nếu medicine charges đã được thêm
//       if (!this.medicineChargesAdded) {
//           log.warn("⚠️ [AGGREGATE GUARD] Cannot remove medicine charges - not added yet for invoice {}",
//                   command.getInvoiceId());
//           return;
//       }
//
//       log.info("✅ [AGGREGATE] Removing medicine charges from invoice: {}", command.getInvoiceId());
       
       AggregateLifecycle.apply(new MedicineChargesRemovedEvent(
               command.getPrescriptionId(),
               command.getInvoiceId()
       ));
   }

   // ==================== EVENT SOURCING HANDLERS ====================
   
   @EventSourcingHandler
   public void on(InvoiceCreateEvent event) {
       log.info("📝 [EVENT SOURCING] Applying InvoiceCreateEvent: invoiceId={}", event.getInvoiceId());
       this.invoiceId = event.getInvoiceId();
       this.status = "CREATED";
   }

   @EventSourcingHandler
   public void on(MedicineChargesAddedEvent event) {
       log.info("📝 [EVENT SOURCING] Applying MedicineChargesAddedEvent: invoiceId={}", event.getInvoiceId());
       this.invoiceId = event.getInvoiceId();
       this.prescriptionId = event.getPrescriptionId();
       this.medicineChargesAdded = true;
       
       // Chuyển sang PENDING nếu chưa phải PAID
       if (!"PAID".equals(this.status)) {
           this.status = "PENDING";
       }
   }

   @EventSourcingHandler
   public void on(InsuranceDiscountUpdatedEvent event) {
       log.info("📝 [EVENT SOURCING] Applying InsuranceDiscountUpdatedEvent: invoiceId={}, claimId={}", 
               event.getInvoiceId(), event.getInsuranceClaimId());
       this.insuranceClaimId = event.getInsuranceClaimId();
       this.insuranceApplied = true;
   }

   @EventSourcingHandler
   public void on(InsuranceDiscountRevertedEvent event) {
       log.info("📝 [EVENT SOURCING] Applying InsuranceDiscountRevertedEvent: invoiceId={}", event.getInvoiceId());
       this.insuranceApplied = false;
       this.insuranceClaimId = null;
   }

   @EventSourcingHandler
   public void on(MedicineChargesRemovedEvent event) {
       log.info("📝 [EVENT SOURCING] Applying MedicineChargesRemovedEvent: invoiceId={}", event.getInvoiceId());
       this.medicineChargesAdded = false;
   }

   @EventSourcingHandler
   public void on(InvoicePaidEvent event){
       log.info("📝 [EVENT SOURCING] Applying InvoicePaidEvent: invoiceId={}", event.getInvoiceId());
       this.status = "PAID";
   }

   @EventSourcingHandler
   public void on(InvoiceCancelledEvent event){
       log.info("📝 [EVENT SOURCING] Applying InvoiceCancelledEvent: invoiceId={}", event.getInvoiceId());
       // ✅ Chỉ chuyển sang CANCELLED nếu chưa PAID
       if (!"PAID".equals(this.status)) {
           this.status = "CANCELLED";
       } else {
           log.warn("⚠️ [AGGREGATE GUARD] Cannot cancel invoice {} - already PAID", event.getInvoiceId());
       }
   }

   // ✅ HELPER methods
   private boolean isPaid() {
       return "PAID".equals(this.status);
   }

   private boolean isCancelled() {
       return "CANCELLED".equals(this.status);
   }
}

