package com.do_an.invoiceservice.aggregate;


import com.do_an.common.command.*;

import com.do_an.common.model.InvoiceCheckerRequest;
import com.do_an.common.model.InvoiceItemCheckerRequest;
import com.do_an.invoiceservice.entity.Invoice;
import com.do_an.invoiceservice.repository.InvoiceRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.axonframework.commandhandling.CommandHandler;
import org.axonframework.modelling.command.AggregateNotFoundException;
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
    @Transactional(readOnly = true)
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
        try{
            Invoice invoice = existingInvoice.get();

            if (!"PENDING".equals(invoice.getStatus())) {
                throw new IllegalStateException("Không thể thêm thuốc vào hóa đơn đang ở trạng thái: " + invoice.getStatus());
            }

            invoiceAggregateRepository.load(command.getInvoiceId().toString())
                    .execute(aggregate -> aggregate.applyAddMedicineCharges(
                            command.getPrescriptionId(),
                            command.getMedicineItems(),
                            invoiceCheckerRequest
                    ));
        } catch (AggregateNotFoundException e) {
            invoiceAggregateRepository.newInstance(() -> new InvoiceAggregate(
                    command.getPrescriptionId(),
                    command.getMedicineItems(),
                    invoiceCheckerRequest
            ));
        }
    }

    @CommandHandler
    @Transactional(readOnly = true)
    public void handle(ApplyInsuranceDiscountCommand command) {
        log.info("Xử lý ApplyInsuranceDiscountCommand cho InvoiceId: {}", command.getInvoiceId());

        Invoice invoice = invoiceRepository.findById(command.getInvoiceId())
                .orElseThrow(() -> new IllegalStateException("Hóa đơn không tồn tại: " + command.getInvoiceId()));

        if (!"PENDING".equals(invoice.getStatus())) {
            throw new IllegalStateException("Không thể áp dụng bảo hiểm cho hóa đơn ở trạng thái: " + invoice.getStatus());
        }

        if (command.getDiscountAmount() < 0) {
            throw new IllegalArgumentException("Số tiền giảm giá không được âm");
        }

        invoiceAggregateRepository.load(command.getInvoiceId().toString())
                .execute(aggregate -> aggregate.applyInsuranceDiscount(
                        command.getInsuranceClaimId(),
                        command.getPrescriptionId(),
                        command.getInvoiceId(),
                        command.getDiscountAmount(),
                        command.getItems()
                ));
    }

    @CommandHandler
    @Transactional
    public void handle(CreateInvoiceCommand command) throws Exception {
        log.info("CreateInvoiceCommand clinicalId={}, appointmentId={}, services={}",
                command.getClinicalId(), command.getAppointmentId(), command.getMedicalServices() != null ? command.getMedicalServices().size() : 0);

        if (command.getMedicalServices() == null || command.getMedicalServices().isEmpty()) {
            throw new IllegalStateException("Không có dịch vụ y tế để tạo hóa đơn");
        }

        invoiceAggregateRepository.newInstance(() -> new InvoiceAggregate(
                command.getClinicalId(),
                command.getInvoiceId(),
                command.getAppointmentId(),
                command.getPatientId(),
                command.getMedicalHistoryId(),
                command.getDoctorId(),
                command.getMedicalServices()
        ));
    }

    @CommandHandler
    @Transactional(readOnly = true)
    public void handle(CancelInvoiceCommand command) {
        // Validate: Chỉ hủy được nếu chưa PAID
        Invoice invoice = invoiceRepository.findById(command.getInvoiceId())
                .orElseThrow(() -> new IllegalStateException("Hóa đơn không tồn tại: " + command.getInvoiceId()));

        if ("PAID".equals(invoice.getStatus())) {
            throw new IllegalStateException("Không thể hủy hóa đơn đã thanh toán!");
        }

        invoiceAggregateRepository.load(command.getInvoiceId().toString())
                .execute(aggregate -> aggregate.applyCancelInvoice(
                        command.getInvoiceId(),
                        command.getReason()
                ));

    }

    @CommandHandler
    public void handle(MarkInvoiceAsPaidCommand command) {
        Invoice invoice = invoiceRepository.findById(command.getInvoiceId())
                .orElseThrow(() -> new IllegalStateException("Hóa đơn không tồn tại: " + command.getInvoiceId()));
        // Validate: Không thể thanh toán hóa đơn đã hủy hoặc đã thanh toán
        if ("PAID".equals(invoice.getStatus())) {
            // Có thể log warning và return (Idempotent) thay vì throw lỗi
            return;
        }

        if ("CANCELLED".equals(invoice.getStatus())) {
            throw new IllegalStateException("Không thể thanh toán hóa đơn đã bị hủy.");
        }



        invoiceAggregateRepository.load(command.getInvoiceId().toString())
                .execute(aggregate -> aggregate.applyInvoicePaid(
                        command.getInvoiceId()
                ));
    }

    @CommandHandler
    public void handle(RevertInsuranceDiscountCommand command){
            log.info("Hoàn lại giảm giá bảo hiểm cho hóa đơn: {}", command.getInvoiceId());
            Invoice invoice = invoiceRepository.findById(command.getInvoiceId())
                    .orElseThrow(() -> new RuntimeException("Không tìm thấy hoá đơn"));

            invoiceAggregateRepository.load(command.getInvoiceId().toString())
                .execute(aggregate -> aggregate.applyRevertInsuranceDiscount(
                        command.getPrescriptionId(),
                        command.getInvoiceId()
                ));
    }

    @CommandHandler
    public void handle(RemoveMedicineChargesCommand command){
        log.info("Loại bỏ phí thuốc cho hóa đơn: {}", command.getInvoiceId());

        Invoice invoice = invoiceRepository.findById(command.getInvoiceId())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy hoá đơn"));

        invoiceAggregateRepository.load(command.getInvoiceId().toString())
                .execute(aggregate -> aggregate.applyRemoveMedicineCharges(
                        command.getPrescriptionId(),
                        command.getInvoiceId()
                ));
    }


}