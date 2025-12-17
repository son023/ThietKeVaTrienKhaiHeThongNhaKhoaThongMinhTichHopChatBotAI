package com.do_an.prescriptionbillingservice.aggregate;


import com.do_an.common.command.CreatePrescriptionCommand;
import com.do_an.prescriptionbillingservice.client.InvoiceClient;
import com.do_an.prescriptionbillingservice.dto.response.InvoiceResponseDTO;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.axonframework.commandhandling.CommandHandler;
import org.axonframework.modelling.command.Repository;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
public class PrescriptionCommandHandler {
    private final Repository<PrescriptionAggregate> prescriptionAggregateRepository;
    private final InvoiceClient invoiceClient;


    @CommandHandler
    public void handle(CreatePrescriptionCommand command) {
        log.info("📥 [COMMAND] CreatePrescriptionCommand: appointmentId={}, prescriptionId={}, items={}",
                command.getAppointmentId(), command.getPrescriptionId(), 
                command.getItems() != null ? command.getItems().size() : 0);

        // ✅ VALIDATION
        if (command.getItems() == null || command.getItems().isEmpty()) {
            throw new IllegalStateException("Không có thuốc để tạo đơn thuốc");
        }

        // ✅ IDEMPOTENCY CHECK: Load aggregate để kiểm tra đã tồn tại chưa
        try {
            prescriptionAggregateRepository.load(command.getPrescriptionId().toString());
            log.warn("⚠️ [COMMAND HANDLER GUARD] PrescriptionAggregate {} already exists, skipping creation", 
                    command.getPrescriptionId());
            return; // Aggregate đã tồn tại, không tạo mới
        } catch (Exception loadException) {
            // Aggregate chưa tồn tại, tiếp tục tạo mới
            log.info("✅ [COMMAND HANDLER] PrescriptionAggregate {} not found, creating new", command.getPrescriptionId());
        }



        try {

            // Lấy invoice
            List<InvoiceResponseDTO> invoices = invoiceClient.getInvoicesByAppointmentId(command.getAppointmentId());

            if (invoices.isEmpty()) {
                throw new IllegalStateException("Không tìm thấy hóa đơn cho appointment: " + command.getAppointmentId());
            }

            // Tạo aggregate mới
            prescriptionAggregateRepository.newInstance(() -> new PrescriptionAggregate(
                    command.getPrescriptionId(),
                    invoices.get(0).getId(),
                    command.getPatientId(),
                    command.getDoctorId(),
                    command.getMedicalHistoryId(),
                    command.getItems()
            ));
            
            log.info("✅ [COMMAND HANDLER] Successfully created PrescriptionAggregate: {}", command.getPrescriptionId());

        } catch (Exception e) {
            log.error("❌ [COMMAND HANDLER] Failed to create PrescriptionAggregate: {}", e.getMessage(), e);
            throw new RuntimeException("Lỗi tạo đơn thuốc: " + e.getMessage(), e);
        }
    }
}
