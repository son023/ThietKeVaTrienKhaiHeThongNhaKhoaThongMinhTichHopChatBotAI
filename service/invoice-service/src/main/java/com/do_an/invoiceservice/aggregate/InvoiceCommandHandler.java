package com.do_an.invoiceservice.aggregate;


import com.do_an.common.command.AddMedicineChargesCommand;
import com.do_an.common.command.ApplyInsuranceDiscountCommand;

import com.do_an.common.model.InvoiceCheckerRequest;
import com.do_an.common.model.InvoiceItemCheckerRequest;
import com.do_an.invoiceservice.entity.Invoice;
import com.do_an.invoiceservice.repository.InvoiceRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.axonframework.commandhandling.CommandHandler;
import org.axonframework.modelling.command.Repository;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

@Component
@RequiredArgsConstructor
@Slf4j
public class InvoiceCommandHandler {
    private final InvoiceRepository invoiceRepository;

    private final Repository<InvoiceAggregate> invoiceAggregateRepository;
    @CommandHandler
    @Transactional
    public void handle(AddMedicineChargesCommand command) throws Exception {
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

        InvoiceCheckerRequest invoiceCheckerRequest = new InvoiceCheckerRequest();
        invoiceCheckerRequest.setId(command.getInvoiceId());
        invoiceCheckerRequest.setItems(itemCheckers);

        Optional<Invoice> existingInvoice = invoiceRepository.findById(command.getInvoiceId());


//        if (existingInvoice.isPresent()) {
//            Invoice invoice = existingInvoice.get();
//
//            if (!"DRAFT".equals(invoice.getStatus()) && !"PENDING".equals(invoice.getStatus())) {
//                throw new IllegalStateException("Không thể thêm thuốc vào hóa đơn đang ở trạng thái: " + invoice.getStatus());
//            }
//
//            invoiceAggregateRepository.load(command.getInvoiceId().toString())
//                    .execute(aggregate -> aggregate.addMedicineCharges(
//                            command.getPrescriptionId(),
//                            command.getInvoiceId(),
//                            command.getMedicineItems(),
//                            invoiceCheckerRequest
//                    ));
//        } else {
//            invoiceAggregateRepository.newInstance(() -> new InvoiceAggregate(
//                    command.getPrescriptionId(),
//                    command.getInvoiceId(),
//                    command.getMedicineItems(),
//                    invoiceCheckerRequest
//            ));
//        }

        try{
            Invoice invoice = existingInvoice.get();

            if (!"DRAFT".equals(invoice.getStatus()) && !"PENDING".equals(invoice.getStatus())) {
                throw new IllegalStateException("Không thể thêm thuốc vào hóa đơn đang ở trạng thái: " + invoice.getStatus());
            }

            invoiceAggregateRepository.load(command.getInvoiceId().toString())
                    .execute(aggregate -> aggregate.addMedicineCharges(
                            command.getPrescriptionId(),
                            command.getInvoiceId(),
                            command.getMedicineItems(),
                            invoiceCheckerRequest
                    ));
        } catch (org.axonframework.modelling.command.AggregateNotFoundException e) {
            invoiceAggregateRepository.newInstance(() -> new InvoiceAggregate(
                    command.getPrescriptionId(),
                    command.getInvoiceId(),
                    command.getMedicineItems(),
                    invoiceCheckerRequest
            ));
        }
    }

    @CommandHandler
    @Transactional
    public void handle(ApplyInsuranceDiscountCommand command) {
        log.info("Xử lý ApplyInsuranceDiscountCommand cho InvoiceId: {}", command.getInvoiceId());

        Invoice invoice = invoiceRepository.findById(command.getInvoiceId())
                .orElseThrow(() -> new IllegalStateException("Hóa đơn không tồn tại: " + command.getInvoiceId()));

        if (!"DRAFT".equals(invoice.getStatus()) && !"PENDING".equals(invoice.getStatus())) {
            throw new IllegalStateException("Không thể áp dụng bảo hiểm cho hóa đơn ở trạng thái: " + invoice.getStatus());
        }

        if (command.getDiscountAmount() < 0) {
            throw new IllegalArgumentException("Số tiền giảm giá không được âm");
        }

        invoiceAggregateRepository.load(command.getInvoiceId().toString())
                .execute(aggregate -> aggregate.applyInsuranceDiscount(
                        command.getPrescriptionId(),
                        command.getInvoiceId(),
                        command.getDiscountAmount(),
                        command.getItems()
                ));
    }

}