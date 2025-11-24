package com.do_an.invoiceservice.aggregate;

import com.do_an.common.event.*;
import com.do_an.common.model.InvoiceItemCheckerRequest;
import com.do_an.common.model.MedicineItem;
import com.do_an.invoiceservice.entity.Invoice;
import com.do_an.invoiceservice.entity.InvoiceItem;
import com.do_an.invoiceservice.exception.InvoiceNotFoundException;
import com.do_an.invoiceservice.mapper.InvoiceSagaMapper;
import com.do_an.invoiceservice.repository.InvoiceItemRepository;
import com.do_an.invoiceservice.repository.InvoiceRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.axonframework.eventhandling.EventBus;
import org.axonframework.eventhandling.EventHandler;
import org.axonframework.eventhandling.GenericEventMessage;
import org.springframework.stereotype.Component;




@Component
@RequiredArgsConstructor
@Slf4j
public class InvoiceEventHandler {

    private final InvoiceRepository invoiceRepository;


    private final InvoiceItemRepository invoiceItemRepository;

    private final InvoiceSagaMapper invoiceSagaMapper;

    private final EventBus eventBus;


    @EventHandler
    @Transactional
    public void on(MedicineChargesAddedEvent event){

        // --- FIX IDEMPOTENCY: KIỂM TRA TRÙNG LẶP ---
        // Nếu hóa đơn đã tồn tại trong DB rồi (do lần chạy trước thành công 1 nửa),
        // thì ta KHÔNG làm gì cả, coi như thành công để Saga đi tiếp.

//        if (invoiceRepository.existsById(event.getInvoiceId())) {
//            log.warn("Invoice {} đã tồn tại. Bỏ qua bước tạo DB để đảm bảo Idempotency.", event.getInvoiceId());
//            return;
//        }


        try {
            // Load invoice from database
            Invoice invoice = invoiceRepository.findById(event.getInvoiceId())
                    .orElseThrow(() -> new InvoiceNotFoundException("Invoice not found: " + event.getInvoiceId()));

            // Validate invoice status
            if (!"DRAFT".equals(invoice.getStatus()) && !"PENDING".equals(invoice.getStatus())) {
                throw new RuntimeException("Invalid invoice status: " + invoice.getStatus());
            }

            // Add medicine items to invoice
            int addedAmount = 0;
            for (InvoiceItemCheckerRequest medicineItem : event.getInvoiceItemCheckerRequest().getItems()) {
                InvoiceItem invoiceItem = new InvoiceItem();
                invoiceItem.setId(medicineItem.getId());
                invoiceItem.setServiceType("MEDICINE");
                invoiceItem.setReferenceId(medicineItem.getReferenceId());
                invoiceItem.setQuantity(medicineItem.getQuantity());
                invoiceItem.setDescription(medicineItem.getDescription());
                //inventory-serivce nhận medicineItem.getMedicineId() để tra cứu giá tiền của thuốc
                //medicineRepository.findById().getSalePrice()-->price

                invoiceItem.setUnitPrice(medicineItem.getUnitPrice());
                for(MedicineItem it : event.getMedicineItems()){
                   if(it.getId() == medicineItem.getId()){
                       invoiceItem.setDescription(it.getName());
                       break;
                   }
                }

                invoiceItem.setInvoice(invoice);

                invoice.addItem(invoiceItem);
                invoiceItemRepository.save(invoiceItem);

                addedAmount += (medicineItem.getQuantity() * medicineItem.getUnitPrice());
            }

            // Update total amount
            invoice.setTotalAmount((invoice.getTotalAmount() != null ? invoice.getTotalAmount() : 0) + addedAmount);
            Invoice invoiceSaved = invoiceRepository.save(invoice);

            log.info("Successfully added medicine charges to Invoice: {}", invoice.getId());

        } catch (Exception e) {
            log.error("Failed to process Invoice charges: {}", e.getMessage());

            // Bắn sự kiện lỗi để Saga biết đường Rollback
            eventBus.publish(GenericEventMessage.asEventMessage(
                    new ChargesAdditionFailedEvent(
                            event.getPrescriptionId(),
                            event.getInvoiceId(),
                            e.getMessage()
                    )
            ));

            throw new RuntimeException("Rollback Invoice DB Transaction", e);
        }
    }

    @EventHandler
    @Transactional
    public void on(InsuranceDiscountUpdatedEvent event){
        try {
            Invoice invoice = invoiceRepository.findById(event.getInvoiceId())
                    .orElseThrow(() -> new InvoiceNotFoundException("Invoice not found: " + event.getInvoiceId()));

            // Validate invoice status
            if (!"DRAFT".equals(invoice.getStatus()) && !"PENDING".equals(invoice.getStatus())) {
                throw new RuntimeException("Invalid status for discount");
            }

            // Apply discount
            Integer currentTotal = invoice.getTotalAmount() != null ? invoice.getTotalAmount() : 0;
            Integer discount = event.getDiscountAmount() != null ? event.getDiscountAmount() : 0;


            // Update total amount after discount
            Integer finalAmount = Math.max(0, currentTotal - discount);
            invoice.setInsuranceTotalPay(discount);
            invoice.setPatientTotalPay(finalAmount);


            invoiceRepository.save(invoice);
            log.info("Insurance discount applied successfully");

        } catch (Exception e) {
            log.error("Failed to apply discount: {}", e.getMessage());

            eventBus.publish(GenericEventMessage.asEventMessage(
                    new InsuranceUpdateFailedEvent(
                            event.getPrescriptionId(),
                            event.getInvoiceId(),
                            e.getMessage()
                    )
            ));
            throw new RuntimeException("Rollback Discount", e);
        }
    }

    // --- XỬ LÝ ROLLBACK: HỦY GIẢM GIÁ (COMPENSATION) ---
    @EventHandler
    @Transactional
    public void on(InsuranceDiscountRevertedEvent event) {
        try {
            log.info("Reverting Insurance Discount for Invoice: {}", event.getInvoiceId());

            Invoice invoice = invoiceRepository.findById(event.getInvoiceId())
                    .orElseThrow(() -> new RuntimeException("Invoice not found"));

            // Reset về 0
            invoice.setInsuranceTotalPay(0);
            invoice.setPatientTotalPay(invoice.getTotalAmount()); // Trả về nguyên giá

            invoiceRepository.save(invoice);
            log.info("Discount reverted successfully");

        } catch (Exception e) {
            log.error("Failed to revert discount: {}", e.getMessage());
            // Không cần throw exception ở đây vì đây là bước rollback cuối cùng
        }
    }

    // --- XỬ LÝ ROLLBACK: XÓA THUỐC (COMPENSATION) ---
    @EventHandler
    @Transactional
    public void on(MedicineChargesRemovedEvent event) {
        try {
            log.info("Removing Medicine Charges for Invoice: {}", event.getInvoiceId());

            Invoice invoice = invoiceRepository.findById(event.getInvoiceId())
                    .orElseThrow(() -> new RuntimeException("Invoice not found"));

            // Tìm và xóa các item là thuốc
            // Lưu ý: Cần cẩn thận với ConcurrentModificationException khi xóa trong loop
            // Nên dùng query delete hoặc iterator remove

            var items = invoiceItemRepository.findByInvoiceId(invoice.getId());
            int removedAmount = 0;

            for (InvoiceItem item : items) {
                if ("MEDICINE".equals(item.getServiceType())) {
                    removedAmount += (item.getQuantity() * item.getUnitPrice());
                    invoiceItemRepository.delete(item);
                }
            }

            // Cập nhật lại tổng tiền
            int newTotal = (invoice.getTotalAmount() != null ? invoice.getTotalAmount() : 0) - removedAmount;
            invoice.setTotalAmount(Math.max(0, newTotal));
            invoice.setPatientTotalPay(Math.max(0, newTotal)); // Reset patient pay

            invoiceRepository.save(invoice);
            log.info("Medicine charges removed successfully");

        } catch (Exception e) {
            log.error("Failed to remove charges: {}", e.getMessage());
        }
    }


}
