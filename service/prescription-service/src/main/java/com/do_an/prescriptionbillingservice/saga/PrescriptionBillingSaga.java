package com.do_an.prescriptionbillingservice.saga;

import com.do_an.common.command.*;
import com.do_an.common.event.*;
import com.do_an.common.model.MedicineItem;
import lombok.extern.slf4j.Slf4j;
import org.axonframework.commandhandling.gateway.CommandGateway;
import org.axonframework.eventhandling.gateway.EventGateway;
import org.axonframework.modelling.saga.EndSaga;
import org.axonframework.modelling.saga.SagaEventHandler;
import org.axonframework.modelling.saga.SagaLifecycle;
import org.axonframework.modelling.saga.StartSaga;
import org.axonframework.spring.stereotype.Saga;
import org.springframework.beans.factory.annotation.Autowired;
import java.nio.charset.StandardCharsets;


import java.util.List;
import java.util.UUID;

@Saga
@Slf4j
public class PrescriptionBillingSaga {

    @Autowired
    private transient CommandGateway commandGateway;

    @Autowired
    private transient EventGateway eventGateway;

    // Lưu trữ trạng thái tạm thời để dùng cho các bước sau hoặc rollback
    private UUID patientId;
    private UUID invoiceId;
    private UUID dispenseOrderId;
    private UUID insuranceClaimId;
    private String doctorId;
    private List<MedicineItem> medicineItems;
    private Integer discountAmount;

    // ✅ THÊM: Track event processing để đảm bảo idempotency
    private boolean medicineReserveCommandSent = false;
    private boolean chargesAddCommandSent = false;
    private boolean insuranceValidateCommandSent = false;
    private boolean discountApplyCommandSent = false;


    // BƯỚC 1: Bắt đầu -> Gửi lệnh Giữ thuốc
    @StartSaga
    @SagaEventHandler(associationProperty = "prescriptionId")
    public void on(PrescriptionCreatedEvent event) {
         log.info("🔵 [SAGA START] PrescriptionCreatedEvent: prescriptionId={}", event.getPrescriptionId());
        
        // ✅ Chỉ xử lý nếu chưa được xử lý (idempotency check)
        if (this.dispenseOrderId != null) {
            log.warn("⚠️ PrescriptionCreatedEvent already processed, skipping...");
            return;
        }

        this.doctorId = event.getDoctorId().toString();
        this.patientId = event.getPatientId();
        this.medicineItems = event.getItems();
        this.invoiceId = event.getInvoiceId();

        SagaLifecycle.associateWith("invoiceId", String.valueOf(this.invoiceId));

       // ✅ DETERMINISTIC ID: Dựa vào prescriptionId thay vì random
        this.dispenseOrderId = generateDeterministicUUID(event.getPrescriptionId(), "DISPENSE");

        // ✅ Check nếu command đã được gửi rồi
        if (!medicineReserveCommandSent) {
            medicineReserveCommandSent = true;
            commandGateway.send(new ReserveMedicineCommand(
                    this.dispenseOrderId,
                    event.getPrescriptionId(),
                    event.getDoctorId(),
                    event.getMedicalHistoryId(),
                    event.getItems()
            )).exceptionally(exception -> {
                log.error("❌ [SAGA STEP 1 FAILED] Lỗi kỹ thuật khi gọi Inventory Service: {}", exception.getMessage());
                medicineReserveCommandSent = false; // Reset để có thể retry
                
                // ✅ Thông báo lỗi kỹ thuật cho người dùng
                notifyUser(
                    event.getPrescriptionId(),
                    "INVENTORY",
                    "FAILED",
                    "Lỗi kỹ thuật: Không thể kết nối với hệ thống quản lý kho. Vui lòng thử lại sau."
                );
                
                SagaLifecycle.end();
                return null;
            });
        }
    }

    // BƯỚC 2: Thuốc đã giữ -> Cộng tiền vào hóa đơn
    @SagaEventHandler(associationProperty = "prescriptionId")
    public void on(MedicineReservedEvent event) {
        log.info("✅ STEP 1 OK: Thuốc đã giữ. -> STEP 2: Thêm phí thuốc vào Invoice: {}", this.invoiceId);
        
        // ✅ Idempotency check
        if (chargesAddCommandSent) {
            log.warn("⚠️ AddMedicineChargesCommand already sent, skipping...");
            return;
        }
        chargesAddCommandSent = true;
        commandGateway.send(new AddMedicineChargesCommand(
                this.invoiceId,
                event.getPrescriptionId(),
                this.medicineItems
        )).exceptionally(exception -> {
            // LOGIC XỬ LÝ KHI INVOICE SERVICE BỊ TẮT HOẶC LỖI KẾT NỐI
            log.error("❌ [SAGA STEP 2 FAILED] Lỗi kỹ thuật khi gọi Invoice Service: {}", exception.getMessage());
            chargesAddCommandSent = false; // Reset để retry
            
            // ✅ Thông báo lỗi kỹ thuật cho người dùng
            notifyUser(
                event.getPrescriptionId(),
                "INVOICE",
                "FAILED",
                "Lỗi kỹ thuật: Không thể kết nối với hệ thống hóa đơn. Đang hoàn tác giao dịch..."
            );
            
            // Kích hoạt bù trừ (Compensation) ngay lập tức: Trả lại thuốc vào kho
            triggerRollbackInventory(event.getPrescriptionId());

            return null;
        });
    }

    // BƯỚC 3: Tiền đã cộng -> Thẩm định bảo hiểm
    @SagaEventHandler(associationProperty = "prescriptionId")
    public void on(MedicineChargesAddedEvent event) {
      
        log.info("✅ STEP 2 OK: Phí thuốc đã thêm. -> STEP 3: Gửi lệnh thẩm định bảo hiểm (ClaimId: {})", this.insuranceClaimId);
        
          // ✅ Idempotency check
        if (insuranceValidateCommandSent) {
            log.warn("⚠️ ValidateInsuranceCommand already sent, skipping...");
            return;
        }
        // ✅ DETERMINISTIC ID
        if (this.insuranceClaimId == null) {
            this.insuranceClaimId = generateDeterministicUUID(event.getPrescriptionId(), "INSURANCE");
        }
        insuranceValidateCommandSent = true;
        
        
        commandGateway.send(new ValidateInsuranceCommand(
                this.insuranceClaimId,
                event.getPrescriptionId(),
                this.invoiceId,
                this.patientId,
                event.getInvoiceItemCheckerRequest()
        )).exceptionally(exception -> {
            // --- XỬ LÝ KHI INSURANCE SERVICE BỊ DOWN ---
            log.error("❌ [SAGA STEP 3 FAILED] Lỗi kỹ thuật khi gọi Insurance Service: {}", exception.getMessage());
            insuranceValidateCommandSent = false;
            
            // ✅ Thông báo lỗi kỹ thuật cho người dùng
            notifyUser(
                event.getPrescriptionId(),
                "INSURANCE",
                "FAILED",
                "Lỗi kỹ thuật: Không thể kết nối với hệ thống bảo hiểm. Đang hoàn tác giao dịch..."
            );
            
            // -> Kích hoạt Rollback từ bước Invoice (Remove Charges)
            triggerRollbackCharges(event.getPrescriptionId());

            return null;
        });
    }

    // BƯỚC 4: Bảo hiểm OK -> Cập nhật giảm giá vào hóa đơn
    @SagaEventHandler(associationProperty = "prescriptionId")
    public void on(InsuranceValidatedEvent event) {
    
        log.info("✅ STEP 3 OK: Bảo hiểm hợp lệ. -> STEP 4: Cập nhật giảm giá vào Invoice.");

        if (discountApplyCommandSent) {
            log.warn("⚠️ ApplyInsuranceDiscountCommand already sent, skipping...");
            return;
        }
        this.discountAmount = event.getCoverageAmount();
        discountApplyCommandSent = true;


        commandGateway.send(new ApplyInsuranceDiscountCommand(
                this.insuranceClaimId,
                this.invoiceId,
                event.getPrescriptionId(),
                event.getCoverageAmount(),
                event.getItems()
        )).exceptionally(exception -> {
            // --- XỬ LÝ KHI INVOICE SERVICE BỊ DOWN (LẦN 2) ---
            log.error("❌ [SAGA STEP 4 FAILED] Lỗi kỹ thuật khi cập nhật giảm giá Invoice: {}", exception.getMessage());
            discountApplyCommandSent = false;
            
            // ✅ Thông báo lỗi kỹ thuật cho người dùng
            notifyUser(
                event.getPrescriptionId(),
                "INVOICE_DISCOUNT",
                "FAILED",
                "Lỗi kỹ thuật: Không thể cập nhật giảm giá bảo hiểm vào hóa đơn. Đang hoàn tác giao dịch..."
            );
            
            // -> Kích hoạt Rollback toàn phần từ bước Insurance (Cancel Claim)
            triggerRollbackInsuranceClaim(event.getPrescriptionId());

            return null;
        });
    }



    @EndSaga
    @SagaEventHandler(associationProperty = "prescriptionId")
    public void on(InvoiceDiscountAppliedSuccessEvent event) {
        log.info("🎉 [SAGA COMPLETED] PRE-BILLING HOÀN TẤT: Hóa đơn đã sẵn sàng để thanh toán.");
        notifyUser(
                event.getPrescriptionId(),
                "COMPLETED",
                "SUCCESS",
                "✅ Tạo đơn thuốc thành công! Hóa đơn đã được cập nhật với giảm giá bảo hiểm và sẵn sàng thanh toán."
        );
    }

    // ❌ ROLLBACK: Không đủ thuốc trong kho
    @EndSaga
    @SagaEventHandler(associationProperty = "prescriptionId")
    public void on(MedicineReservationFailedEvent event) {
        log.error("❌ [SAGA FAILED - STEP 1] Kiểm tra kho thất bại - Không đủ thuốc!");

        notifyUser(
                event.getPrescriptionId(),
                "INVENTORY_CHECK",
                "FAILED",
                "❌ Không thể tạo đơn thuốc: Một số thuốc trong đơn không đủ số lượng tồn kho. Vui lòng điều chỉnh đơn thuốc hoặc liên hệ dược sĩ."
        );
    }

    // ❌ ROLLBACK HOÀN TẤT: Đã trả thuốc về kho
    @EndSaga
    @SagaEventHandler(associationProperty = "prescriptionId")
    public void on(MedicineReservationReleasedEvent event) {
        log.warn("⚠️ [SAGA ROLLED BACK] Đã hoàn tác toàn bộ: Thuốc đã được trả về kho.");
        
        notifyUser(
                event.getPrescriptionId(),
                "ROLLBACK_COMPLETED",
                "CANCELLED",
                "⚠️ Giao dịch đã được hoàn tác. Thuốc đã trả về kho. Vui lòng thử tạo đơn thuốc lại."
        );
    }

    // ❌ DATABASE FAILURE: Lỗi lưu chi tiết hóa đơn
    @SagaEventHandler(associationProperty = "prescriptionId")
    public void on(ChargesAdditionFailedEvent event) {
        log.error("❌ [SAGA STEP 2 DB FAILED] Lỗi lưu database Invoice. Lý do: {}. -> Bắt đầu Rollback Inventory.", event.getReason());
        
        notifyUser(
                event.getPrescriptionId(),
                "INVOICE_DATABASE",
                "FAILED",
                "❌ Lỗi hệ thống: Không thể lưu chi tiết hóa đơn vào cơ sở dữ liệu. Đang hoàn tác giao dịch..."
        );

        triggerRollbackInventory(event.getPrescriptionId());
    }

    // 🔄 ROLLBACK IN PROGRESS: Phí thuốc đã xóa, tiếp tục trả thuốc về kho
    @SagaEventHandler(associationProperty = "prescriptionId")
    public void on(MedicineChargesRemovedEvent event) {
        log.info("🔄 [ROLLBACK STEP 2] Phí thuốc đã xóa khỏi hóa đơn. -> Tiếp tục: Trả thuốc về kho.");
        
//        notifyUser(
//                event.getPrescriptionId(),
//                "ROLLBACK_INVOICE",
//                "IN_PROGRESS",
//                "🔄 Đang hoàn tác: Đã xóa chi phí thuốc khỏi hóa đơn. Đang trả thuốc về kho..."
//        );
        
        triggerRollbackInventory(event.getPrescriptionId());
    }


    // ⚠️ INSURANCE REJECTED: Bảo hiểm không hợp lệ nhưng tiếp tục quy trình
    @EndSaga
    @SagaEventHandler(associationProperty = "prescriptionId")
    public void on(InsuranceRejectedEvent event) {
        // NOTE: Xác minh bảo hiểm thất bại KHÔNG rollback - cho phép thanh toán không bảo hiểm
        
        log.warn("⚠️ [SAGA STEP 3 SKIPPED] Bảo hiểm không hợp lệ: {}. Tiếp tục với thanh toán không bảo hiểm.", event.getReason());
        
        notifyUser(
                event.getPrescriptionId(),
                "COMPLETED",
                "SUCCESS",
                "✅ Tạo đơn thuốc thành công! \n⚠️ Lưu ý: " + event.getReason() + "\nHóa đơn sẽ được thanh toán toàn bộ không có giảm giá bảo hiểm."
        );
    }

    // 🔄 ROLLBACK IN PROGRESS: Hủy claim bảo hiểm, tiếp tục xóa phí thuốc
    @SagaEventHandler(associationProperty = "prescriptionId")
    public void on(InsuranceClaimCancelledEvent event) {
        log.info("🔄 [ROLLBACK STEP 3] Đã hủy yêu cầu bảo hiểm. -> Tiếp tục: Xóa phí thuốc khỏi hóa đơn.");
        
//        notifyUser(
//                event.getPrescriptionId(),
//                "ROLLBACK_INSURANCE",
//                "IN_PROGRESS",
//                "🔄 Đang hoàn tác: Đã hủy yêu cầu bảo hiểm. Đang xóa phí thuốc khỏi hóa đơn..."
//        );
        
        triggerRollbackCharges(event.getPrescriptionId());
    }

    // ❌ DATABASE FAILURE: Lỗi cập nhật giảm giá vào hóa đơn
    @SagaEventHandler(associationProperty = "prescriptionId")
    public void on(InvoiceDiscountAppliedFailedEvent event) {
        log.error("❌ [SAGA STEP 4 DB FAILED] Lỗi cập nhật giảm giá vào database Invoice. Lý do: {}. -> Bắt đầu Rollback: Hủy Claim.", event.getReason());
        
        notifyUser(
                event.getPrescriptionId(),
                "INVOICE_DISCOUNT_DATABASE",
                "FAILED",
                "❌ Lỗi hệ thống: Không thể cập nhật giảm giá bảo hiểm vào cơ sở dữ liệu. Đang hoàn tác giao dịch..."
        );
        
        triggerRollbackInsuranceClaim(event.getPrescriptionId());
    }


    private void triggerRollbackCharges(UUID prescriptionId) {
        commandGateway.send(new RemoveMedicineChargesCommand(
                this.invoiceId,
                prescriptionId
        ));
    }

    private void triggerRollbackInventory(UUID prescriptionId) {
        commandGateway.send(new ReleaseMedicineReservationCommand(
                this.dispenseOrderId,
                prescriptionId
                //this.medicineItems
        ));
    }

    private void triggerRollbackInsuranceClaim(UUID prescriptionId){
        commandGateway.send(new CancelInsuranceClaimCommand(
                this.insuranceClaimId,
                prescriptionId,
                "Rollback do lỗi cập nhật hóa đơn cho InsuranceClaim: " + this.insuranceClaimId
        ));
    }


    private void notifyUser(UUID trackingId, String step, String status, String message) {
        if (eventGateway != null && this.doctorId != null) {
            // Sự kiện này sẽ được Notification Service bắt và đẩy xuống WebSocket
            eventGateway.publish(new PrescriptionProcessNotificationEvent(
                    this.doctorId,
                    trackingId.toString(),
                    step,
                    status,
                    message
            ));
        }
    }

        // ✅ HELPER: Tạo deterministic UUID từ seed
    private UUID generateDeterministicUUID(UUID seed, String suffix) {
        try {
            String combined = seed.toString() + "-" + suffix;
            return UUID.nameUUIDFromBytes(combined.getBytes(StandardCharsets.UTF_8));
        } catch (Exception e) {
            log.error("Error generating deterministic UUID, fallback to random", e);
            return UUID.randomUUID();
        }
    }




}