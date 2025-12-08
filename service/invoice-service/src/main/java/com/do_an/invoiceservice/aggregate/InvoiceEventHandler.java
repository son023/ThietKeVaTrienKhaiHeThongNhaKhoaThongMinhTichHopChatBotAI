package com.do_an.invoiceservice.aggregate;

import com.do_an.common.event.*;
import com.do_an.common.model.InvoiceItemCheckerRequest;
import com.do_an.common.model.InvoiceItemResponse;
import com.do_an.common.model.MedicineItem;
import com.do_an.invoiceservice.entity.Invoice;
import com.do_an.invoiceservice.entity.InvoiceItem;
import com.do_an.invoiceservice.exception.InvoiceNotFoundException;
import com.do_an.invoiceservice.mapper.InvoiceItemMapper;
import com.do_an.invoiceservice.repository.InvoiceItemRepository;
import com.do_an.invoiceservice.repository.InvoiceRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.axonframework.eventhandling.EventBus;
import org.axonframework.eventhandling.EventHandler;
import org.axonframework.eventhandling.GenericEventMessage;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;


@Component
@RequiredArgsConstructor
@Slf4j
public class InvoiceEventHandler {

    private final InvoiceRepository invoiceRepository;

    private final InvoiceItemRepository invoiceItemRepository;

    private final InvoiceItemMapper invoiceItemMapper;

    private final EventBus eventBus;


    @EventHandler
    @Transactional
        public void on(MedicineChargesAddedEvent event){
        try {
            Invoice invoice = invoiceRepository.findById(event.getInvoiceId()).get();

            int addedAmount = 0;

            for (InvoiceItemCheckerRequest medicineItem : event.getInvoiceItemCheckerRequest().getItems()) {
                InvoiceItem invoiceItem = new InvoiceItem();
                invoiceItem.setId(medicineItem.getId());
                invoiceItem.setServiceType("MEDICINE");
                invoiceItem.setReferenceId(medicineItem.getReferenceId());
                invoiceItem.setQuantity(medicineItem.getQuantity());
                invoiceItem.setDescription(medicineItem.getDescription());
                invoiceItem.setUnitPrice(medicineItem.getUnitPrice());

                for (MedicineItem it : event.getMedicineItems()) {
                    if (medicineItem.getId().equals(it.getId()) ||
                            it.getMedicineId().equals(medicineItem.getReferenceId())) {
                        invoiceItem.setDescription(it.getName());
                        break;
                    }
                }

                invoiceItem.setInvoice(invoice);
                invoice.addItem(invoiceItem);
                invoiceItemRepository.save(invoiceItem);

                addedAmount += (medicineItem.getQuantity() * medicineItem.getUnitPrice());
            }

            invoice.setTotalAmount((invoice.getTotalAmount() != null ? invoice.getTotalAmount() : 0) + addedAmount);

            Invoice invoiceSaved = invoiceRepository.save(invoice);

            //log.info("Đã cập nhật Invoice DB thành công. Tổng tiền mới: {}", (invoice.getTotalAmount() != null ? invoice.getTotalAmount() : 0) + addedAmount);
            log.info("Đã cập nhật Invoice DB thành công. Tổng tiền mới: {}", (invoice.getTotalAmount() != null ? invoiceSaved.getTotalAmount() : 0));

        } catch (Exception e) {
            log.error("LỖI NGHIÊM TRỌNG khi cập nhật Invoice DB: {}", e.getMessage());

            //COMPENSATION: PHÁT SỰ KIỆN LỖI ĐỂ SAGA ROLLBACK
            //Nếu lưu DB thất bại, Saga cần biết để rollback bước Inventory trước đó
            eventBus.publish(GenericEventMessage.asEventMessage(
                    new ChargesAdditionFailedEvent(
                            event.getPrescriptionId(),
                            event.getInvoiceId(),
                            "Lỗi DB Invoice: " + e.getMessage()
                    )
            ));

            throw new RuntimeException("Hoàn tác giao dịch hóa đơn", e);
        }
    }

    @EventHandler
    @Transactional
    public void on(InsuranceDiscountUpdatedEvent event){
        //BỎ COMMENT NÀY ĐỂ TEST LUỒNG ROLLBACK FULL
//        eventBus.publish(GenericEventMessage.asEventMessage(
//                new InvoiceDiscountAppliedFailedEvent(
//                        event.getPrescriptionId(),
//                        event.getInvoiceId(),
//                        "Lỗi cơ sở dữ liệu: "
//                )
//        ));

        try {
            Invoice invoice = invoiceRepository.findById(event.getInvoiceId())
                    .orElseThrow(() -> new InvoiceNotFoundException("Không tìm thấy hoá đơn: " + event.getInvoiceId()));

            Integer currentTotal = invoice.getTotalAmount() != null ? invoice.getTotalAmount() : 0;
            Integer discount = event.getDiscountAmount() != null ? event.getDiscountAmount() : 0;

            Integer finalAmount = Math.max(0, currentTotal - discount);

            invoice.setInsuranceClaimId(event.getInsuranceClaimId());
            invoice.setInsuranceTotalPay(discount);
            invoice.setPatientTotalPay(finalAmount);

            invoiceRepository.save(invoice);
            List<InvoiceItem> existingItems = invoiceItemRepository.findByInvoiceId(event.getInvoiceId());
            Map<UUID, InvoiceItem> existingMap = existingItems.stream()
                    .collect(Collectors.toMap(InvoiceItem::getId, item -> item));
            List<InvoiceItem> itemsToUpdate = new ArrayList<>();

            for (InvoiceItemResponse it : event.getItems()) {
                if (existingMap.containsKey(it.getId())) {
                    InvoiceItem entity = existingMap.get(it.getId());
                    invoiceItemMapper.updateFromResponse(it, entity);
                    itemsToUpdate.add(entity);
                }
            }

            invoiceItemRepository.saveAll(itemsToUpdate);

                eventBus.publish(GenericEventMessage.asEventMessage(
                        new InvoiceDiscountAppliedSuccessEvent(
                                event.getPrescriptionId(),
                                event.getInvoiceId()
                        )
                ));
            log.info("Đã cập nhật giảm giá thành công. Bảo hiểm trả: {}, Bệnh nhân trả: {}", discount, finalAmount);
        } catch (Exception e) {
            log.error("LỖI KỸ THUẬT khi cập nhật giảm giá: {}", e.getMessage());
            // 4. COMPENSATION: Nếu lỗi DB, báo Saga biết để Rollback bước trước
            eventBus.publish(GenericEventMessage.asEventMessage(
                    new InvoiceDiscountAppliedFailedEvent(
                            event.getPrescriptionId(),
                            event.getInvoiceId(),
                            "Lỗi cơ sở dữ liệu: " + e.getMessage()
                    )
            ));
            throw new RuntimeException("Hoàn tác Cập nhật Giảm giá", e);
        }

    }

    // --- XỬ LÝ ROLLBACK: HỦY GIẢM GIÁ ---(TẠM THỜI CHƯA DÙNG ĐỂ PHỤC VỤ CHO PAYMENT SAU NÀY)
    @EventHandler
    @Transactional
    public void on(InsuranceDiscountRevertedEvent event) {
        try {
            log.info("Hoàn lại giảm giá bảo hiểm cho hóa đơn: {}", event.getInvoiceId());

            Invoice invoice = invoiceRepository.findById(event.getInvoiceId())
                    .orElseThrow(() -> new RuntimeException("Invoice not found"));

            // Reset về 0
            invoice.setInsuranceTotalPay(0);
            invoice.setPatientTotalPay(invoice.getTotalAmount()); // Trả về nguyên giá

            invoiceRepository.save(invoice);
            log.info("Hoàn lại giảm giá thành công");

        } catch (Exception e) {
            log.error("Không thể hoàn lại giảm giá:{}", e.getMessage());
        }
    }

    // --- XỬ LÝ ROLLBACK: XÓA THUỐC ---
    @EventHandler
    @Transactional
    public void on(MedicineChargesRemovedEvent event) {
        try {
            log.info("Loại bỏ phí thuốc cho hóa đơn: {}", event.getInvoiceId());

            Invoice invoice = invoiceRepository.findById(event.getInvoiceId())
                    .orElseThrow(() -> new RuntimeException("Loại bỏ phí thuốc cho hóa đơn: ..."));

            int removedAmount = 0;

            //Xóa tất cả item thuốc của hóa đơn này một lần
            invoiceItemRepository.deleteByInvoice_IdAndServiceType(event.getInvoiceId(), "MEDICINE");

            int newTotal = (invoice.getTotalAmount() != null ? invoice.getTotalAmount() : 0) - removedAmount;
            invoice.setTotalAmount(Math.max(0, newTotal));
            invoice.setPatientTotalPay(Math.max(0, newTotal));
            invoiceRepository.save(invoice);

            log.info("Phí thuốc đã được xoá thành công");

        } catch (Exception e) {
            log.error("Không thể xoá các phí thuốc: {}", e.getMessage());
        }
    }

    @EventHandler
    public void on(InvoiceCancelledEvent event){
        try {
            Invoice invoice = invoiceRepository.findById(event.getInvoiceId()).get();
            invoice.setStatus("CANCELLED");
            invoiceRepository.save(invoice);
            log.info("Đã cập nhật Invoice DB {} thành công sang trạng thái CANCELLED.", invoice.getId());
        }
        catch (Exception e){
            log.error("Không tìm thấy Invoice {} trong DB để hủy.", event.getInvoiceId());
        }
    }

    @EventHandler
    @Transactional
    public void on(InvoicePaidEvent event) {
        try {
            log.info("Nhận sự kiện InvoicePaidEvent. Cập nhật trạng thái PAID cho Invoice: {}", event.getInvoiceId());

            // Tìm Invoice
            Invoice invoice = invoiceRepository.findById(event.getInvoiceId()).get();


            // Cập nhật trạng thái PAID
            invoice.setStatus("PAID");
            invoice.setPaidAt(LocalDateTime.now());
            invoiceRepository.save(invoice);

            //Gửi lệnh sang Inventory để đổi trạng thái từ RESERVED -> SOLD
            //inventoryClient.markAsSold()

            log.info("Đã cập nhật Invoice {} thành công (PAID).", invoice.getId());

        } catch (Exception e) {
            log.error("Lỗi khi xử lý InvoicePaidEvent cho Invoice {}: {}",
                    event.getInvoiceId(), e.getMessage(), e);
        }
    }




}
