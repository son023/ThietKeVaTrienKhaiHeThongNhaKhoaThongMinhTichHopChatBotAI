package com.do_an.invoiceservice.aggregate;

import com.do_an.common.command.AddMedicineChargesCommand;
import com.do_an.common.command.ApplyInsuranceDiscountCommand;
import com.do_an.common.command.RemoveMedicineChargesCommand;
import com.do_an.common.command.RevertInsuranceDiscountCommand;
import com.do_an.common.event.ChargesAdditionFailedEvent;
import com.do_an.common.event.InsuranceDiscountRevertedEvent;
import com.do_an.common.event.InsuranceDiscountUpdatedEvent;
import com.do_an.common.event.InsuranceUpdateFailedEvent;
import com.do_an.common.event.MedicineChargesAddedEvent;
import com.do_an.common.event.MedicineChargesRemovedEvent;
import com.do_an.common.model.InvoiceCheckerRequest;
import com.do_an.common.model.InvoiceItemCheckerRequest;
import com.do_an.common.model.MedicineItem;
import com.do_an.invoiceservice.entity.Invoice;
import com.do_an.invoiceservice.entity.InvoiceItem;
import com.do_an.invoiceservice.exception.InvoiceNotFoundException;
import com.do_an.invoiceservice.mapper.InvoiceSagaMapper;
import com.do_an.invoiceservice.repository.InvoiceItemRepository;
import com.do_an.invoiceservice.repository.InvoiceRepository;
import lombok.NoArgsConstructor;
import org.axonframework.commandhandling.CommandHandler;
import org.axonframework.eventsourcing.EventSourcingHandler;
import org.axonframework.modelling.command.AggregateCreationPolicy;
import org.axonframework.modelling.command.AggregateIdentifier;
import org.axonframework.modelling.command.AggregateLifecycle;
import org.axonframework.modelling.command.CreationPolicy;
import org.axonframework.spring.stereotype.Aggregate;
import org.springframework.beans.factory.annotation.Autowired;

import java.util.List;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

@Aggregate
@NoArgsConstructor
public class InvoiceAggregate {

   @AggregateIdentifier
   private UUID invoiceId;

   private Integer totalAmount;
   private Integer discountAmount;
   private String status;


    // Trạng thái nội tại (nếu cần cho validation sau này, ví dụ để chặn lệnh duplicate)
    private boolean medicineChargesAdded;
    private boolean insuranceApplied;

   @CommandHandler
   @CreationPolicy(AggregateCreationPolicy.CREATE_IF_MISSING)
   public void handle(AddMedicineChargesCommand command) {

       // 1. Tính toán thông tin Invoice Checker
       Set<InvoiceItemCheckerRequest> itemCheckers = command.getMedicineItems().stream()
               .map(item -> {
                   InvoiceItemCheckerRequest itemReq = new InvoiceItemCheckerRequest();
                   itemReq.setId(UUID.randomUUID());
                   itemReq.setReferenceId(item.getMedicineId());
                   itemReq.setServiceType("MEDICINE");
                   itemReq.setQuantity(item.getQuantity());
                   itemReq.setUnitPrice(item.getUnitPrice());
                   itemReq.setDescription(item.getName());
                   return itemReq;
               })
               .collect(Collectors.toSet());


       // Tạo Object Checker Request
       InvoiceCheckerRequest invoiceCheckerRequest = new InvoiceCheckerRequest();
       invoiceCheckerRequest.setId(command.getInvoiceId());
       invoiceCheckerRequest.setItems(itemCheckers);

       // QUAN TRỌNG: Luôn phát sự kiện để Saga nhận được tín hiệu
       // Dù là tạo mới (lần 1) hay retry (lần 2), Saga đều cần Event này để đi tiếp.
       AggregateLifecycle.apply(new MedicineChargesAddedEvent(
               command.getPrescriptionId(),
               command.getInvoiceId(),
               command.getMedicineItems(),
               invoiceCheckerRequest
       ));
   }

   @CommandHandler
   public void handle(ApplyInsuranceDiscountCommand command) {
       // Emit success event
       AggregateLifecycle.apply(new InsuranceDiscountUpdatedEvent(
               command.getPrescriptionId(),
               command.getInvoiceId(),
               command.getDiscountAmount()
       ));

   }

   @CommandHandler
   public void handle(RevertInsuranceDiscountCommand command) {
       // Emit success event
       AggregateLifecycle.apply(new InsuranceDiscountRevertedEvent(
               command.getPrescriptionId(),
               command.getInvoiceId()
       ));
   }

   @CommandHandler
   public void handle(RemoveMedicineChargesCommand command) {
       // Emit success event
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

