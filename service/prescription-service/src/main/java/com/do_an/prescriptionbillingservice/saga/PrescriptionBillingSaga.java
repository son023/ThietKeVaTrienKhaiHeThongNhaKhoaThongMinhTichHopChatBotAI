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


    // BƯỚC 1: Bắt đầu -> Gửi lệnh Giữ thuốc
    @StartSaga
    @SagaEventHandler(associationProperty = "prescriptionId")
    public void on(PrescriptionCreatedEvent event) {
        this.doctorId = event.getDoctorId().toString();
        this.patientId = event.getPatientId();
        this.medicineItems = event.getItems();
        this.invoiceId = event.getInvoiceId();


        SagaLifecycle.associateWith("invoiceId", String.valueOf(this.invoiceId));
        this.dispenseOrderId = UUID.randomUUID();

        //xử lý callback (kết quả trả về)
        commandGateway.send(new ReserveMedicineCommand(
                this.dispenseOrderId,
                event.getPrescriptionId(),
                event.getDoctorId(),
                event.getMedicalHistoryId(),
                event.getItems()
        )).exceptionally(exception -> {
            System.err.println("Saga nhận được lỗi từ Inventory: " + exception.getMessage());

            SagaLifecycle.end();

            //phát một Event thất bại thủ công tại đây cho Notification Service
            return null;
        });
    }

    // BƯỚC 2: Thuốc đã giữ -> Cộng tiền vào hóa đơn
    @SagaEventHandler(associationProperty = "prescriptionId")
    public void on(MedicineReservedEvent event) {
        log.info("✅ STEP 1 OK: Thuốc đã giữ. -> STEP 2: Thêm phí thuốc vào Invoice: {}", this.invoiceId);
        commandGateway.send(new AddMedicineChargesCommand(
                this.invoiceId,
                event.getPrescriptionId(),
                this.medicineItems
        )).exceptionally(exception -> {
            // LOGIC XỬ LÝ KHI INVOICE SERVICE BỊ TẮT HOẶC LỖI KẾT NỐI
            log.error("❌ LỖI GIAO TIẾP: Không thể gọi Invoice Service (Service có thể đang tắt). Lỗi: {}", exception.getMessage());

            // Kích hoạt bù trừ (Compensation) ngay lập tức: Trả lại thuốc vào kho
            triggerRollbackInventory(event.getPrescriptionId());

            return null;
        });
    }

    // BƯỚC 3: Tiền đã cộng -> Thẩm định bảo hiểm
    @SagaEventHandler(associationProperty = "prescriptionId")
    public void on(MedicineChargesAddedEvent event) {
        this.insuranceClaimId = UUID.randomUUID();
        log.info("✅ STEP 2 OK: Phí thuốc đã thêm. -> STEP 3: Gửi lệnh thẩm định bảo hiểm (ClaimId: {})", this.insuranceClaimId);
        commandGateway.send(new ValidateInsuranceCommand(
                this.insuranceClaimId,
                event.getPrescriptionId(),
                this.invoiceId,
                this.patientId,
                event.getInvoiceItemCheckerRequest()
        )).exceptionally(exception -> {
            // --- XỬ LÝ KHI INSURANCE SERVICE BỊ DOWN ---
            log.error("❌ LỖI GIAO TIẾP (STEP 3): Không thể gọi Insurance Service. Lỗi: {}", exception.getMessage());

            // -> Kích hoạt Rollback từ bước Invoice (Remove Charges)
            triggerRollbackCharges(event.getPrescriptionId());

            return null;
        });
    }

    // BƯỚC 4: Bảo hiểm OK -> Cập nhật giảm giá vào hóa đơn
    @SagaEventHandler(associationProperty = "prescriptionId")
    public void on(InsuranceValidatedEvent event) {
        this.discountAmount = event.getCoverageAmount();
        log.info("✅ STEP 3 OK: Bảo hiểm hợp lệ. -> STEP 4: Cập nhật giảm giá vào Invoice.");

        commandGateway.send(new ApplyInsuranceDiscountCommand(
                this.insuranceClaimId,
                this.invoiceId,
                event.getPrescriptionId(),
                event.getCoverageAmount(),
                event.getItems()
        )).exceptionally(exception -> {
            // --- XỬ LÝ KHI INVOICE SERVICE BỊ DOWN (LẦN 2) ---
            log.error("❌ LỖI GIAO TIẾP (STEP 4): Không thể gọi Invoice Service để update giảm giá. Lỗi: {}", exception.getMessage());

            // -> Kích hoạt Rollback toàn phần từ bước Insurance (Cancel Claim)
            triggerRollbackInsuranceClaim(event.getPrescriptionId());

            return null;
        });
    }



    @EndSaga
    @SagaEventHandler(associationProperty = "prescriptionId")
    public void on(InvoiceDiscountAppliedSuccessEvent event) {
        log.info("🎉 SAGA PRE-BILLING HOÀN TẤT: Hóa đơn đã sẵn sàng để thanh toán.");
        notifyUser(
                event.getPrescriptionId(),
                "FINISH",
                "COMPLETED", // Trạng thái cuối cùng
                "Đơn thuốc đã được tạo thành công!"
        );
    }

    //Rollback
    @EndSaga
    @SagaEventHandler(associationProperty = "prescriptionId")
    public void on(MedicineReservationFailedEvent event) {
        //Thông báo cho Notification Service
        System.out.println("SAGA KẾT THÚC: Kiểm tra kho thất bại!");

        notifyUser(
                event.getPrescriptionId(),
                "INVENTORY",
                "FAILED",
                "Lỗi tạo đơn: Kho thuốc không đủ số lượng."
        );
    }

    @EndSaga
    @SagaEventHandler(associationProperty = "prescriptionId")
    public void on(MedicineReservationReleasedEvent event) {
        System.err.println("SAGA KẾT THÚC: Đã rollback toàn bộ quy trình.");
    }

    //Save DB Fail
    @SagaEventHandler(associationProperty = "prescriptionId")
    public void on(ChargesAdditionFailedEvent event) {
        log.error("🛑 FAILURE (STEP 2): Lỗi lưu DB Invoice. Lý do: {}. -> Bắt đầu Rollback Inventory.", event.getReason());
        notifyUser(
                event.getPrescriptionId(),
                "INVOICE",
                "FAILED",
                "Lỗi hệ thống: Không thể tạo chi tiết hóa đơn."
        );

        triggerRollbackInventory(event.getPrescriptionId());
    }

    //Command request for chain
    @SagaEventHandler(associationProperty = "prescriptionId")
    public void on(MedicineChargesRemovedEvent event) {
        log.info("🔄 ROLLBACK PROGRESS: Phí thuốc đã xóa. -> Tiếp tục: Nhả kho (Release Inventory).");
        triggerRollbackInventory(event.getPrescriptionId());
    }


    //Validate Fail
    @EndSaga
    @SagaEventHandler(associationProperty = "prescriptionId")
    public void on(InsuranceRejectedEvent event) {
//        log.warn("🛑 FAILURE (STEP 3): Bảo hiểm từ chối. Lý do: {}. -> Bắt đầu Rollback: Xóa phí thuốc.", event.getReason());
//        notifyUser(
//                event.getPrescriptionId(),
//                "INSURANCE",
//                "FAILED",
//                "Thẻ BHYT không hợp lệ hoặc bị từ chối: " + event.getReason()
//        );
//        triggerRollbackCharges(event.getPrescriptionId());

        //Thay đổi: Xác minh bảo hiểm lỗi thì không cập nhật hoá đơn và tiếp tục sang thanh toán

        log.info("🎉 SAGA PRE-BILLING HOÀN TẤT: Hóa đơn đã sẵn sàng để thanh toán.");
        notifyUser(
                event.getPrescriptionId(),
                "FINISH",
                "COMPLETED", // Trạng thái cuối cùng
                "Đơn thuốc đã được tạo thành công!"
        );
    }

    //Command request for chain
    @SagaEventHandler(associationProperty = "prescriptionId")
    public void on(InsuranceClaimCancelledEvent event) {
        log.info("🔄 ROLLBACK PROGRESS: Claim đã hủy. -> Tiếp tục: Xóa phí thuốc.");
        triggerRollbackCharges(event.getPrescriptionId());
    }

    //Save DB Fail
    @SagaEventHandler(associationProperty = "prescriptionId")
    public void on(InvoiceDiscountAppliedFailedEvent event) {
        log.error("🛑 FAILURE (STEP 4): Lỗi cập nhật Invoice DB. Lý do: {}. -> Bắt đầu Rollback: Hủy Claim.", event.getReason());
        notifyUser(
                event.getPrescriptionId(),
                "FINISH",
                "FAILED",
                "Lỗi hệ thống khi cập nhật giảm giá."
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




}