package com.do_an.invoiceservice.aggregate;


import com.do_an.common.command.RemoveMedicineChargesCommand;
import com.do_an.common.command.RevertInsuranceDiscountCommand;
import com.do_an.common.event.InsuranceDiscountRevertedEvent;
import com.do_an.common.event.InsuranceDiscountUpdatedEvent;
import com.do_an.common.event.MedicineChargesAddedEvent;
import com.do_an.common.event.MedicineChargesRemovedEvent;
import com.do_an.common.model.InvoiceCheckerRequest;
import com.do_an.common.model.MedicineItem;
import lombok.NoArgsConstructor;
import org.axonframework.commandhandling.CommandHandler;
import org.axonframework.eventsourcing.EventSourcingHandler;
import org.axonframework.modelling.command.AggregateIdentifier;
import org.axonframework.modelling.command.AggregateLifecycle;
import org.axonframework.spring.stereotype.Aggregate;

import java.util.List;
import java.util.UUID;


@Aggregate
@NoArgsConstructor
public class InvoiceAggregate {

   @AggregateIdentifier
   private UUID invoiceId;

    // Trạng thái nội tại (nếu cần cho validation sau này, ví dụ để chặn lệnh duplicate)
    private boolean medicineChargesAdded;
    private boolean insuranceApplied;

    public InvoiceAggregate(UUID prescriptionId, UUID invoiceId,
                            List<MedicineItem> medicineItems,
                            InvoiceCheckerRequest invoiceCheckerRequest) {
        AggregateLifecycle.apply(new MedicineChargesAddedEvent(
                prescriptionId,
                invoiceId,
                medicineItems,
                invoiceCheckerRequest
        ));
    }

    public void addMedicineCharges(UUID prescriptionId, UUID invoiceId,
                                   List<MedicineItem> medicineItems,
                                   InvoiceCheckerRequest invoiceCheckerRequest) {
        AggregateLifecycle.apply(new MedicineChargesAddedEvent(
                prescriptionId,
                invoiceId,
                medicineItems,
                invoiceCheckerRequest
        ));
    }

    public void applyInsuranceDiscount(UUID prescriptionId, UUID invoiceId, Integer discountAmount) {
        AggregateLifecycle.apply(new InsuranceDiscountUpdatedEvent(
                prescriptionId,
                invoiceId,
                discountAmount
        ));
    }

   @CommandHandler
   public void handle(RevertInsuranceDiscountCommand command) {
       AggregateLifecycle.apply(new InsuranceDiscountRevertedEvent(
               command.getPrescriptionId(),
               command.getInvoiceId()
       ));
   }

   @CommandHandler
   public void handle(RemoveMedicineChargesCommand command) {
       AggregateLifecycle.apply(new MedicineChargesRemovedEvent(
               command.getPrescriptionId(),
               command.getInvoiceId()
       ));
   }

   @EventSourcingHandler
   public void on(MedicineChargesAddedEvent event) {
       this.invoiceId = event.getInvoiceId();
       this.medicineChargesAdded = true;
   }

   @EventSourcingHandler
   public void on(InsuranceDiscountUpdatedEvent event) {
       this.insuranceApplied = true;
   }

   @EventSourcingHandler
   public void on(InsuranceDiscountRevertedEvent event) {
       this.insuranceApplied = false;
   }

   @EventSourcingHandler
   public void on(MedicineChargesRemovedEvent event) {
       this.medicineChargesAdded = false;
   }
}

