package com.do_an.prescriptionbillingservice.saga;

import com.do_an.common.command.*;
import com.do_an.common.event.*;
import com.do_an.common.model.MedicineItem;
import lombok.extern.slf4j.Slf4j;
import org.axonframework.commandhandling.gateway.CommandGateway;
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

    // Lưu trữ trạng thái tạm thời để dùng cho các bước sau hoặc rollback
    private UUID patientId;
    private UUID invoiceId;
    private UUID dispenseOrderId;
    private UUID insuranceClaimId;


    private List<MedicineItem> medicineItems;
    private Integer discountAmount;


    // BƯỚC 1: Bắt đầu -> Gửi lệnh Giữ thuốc
    @StartSaga
    @SagaEventHandler(associationProperty = "prescriptionId")
    public void on(PrescriptionCreatedEvent event) {
        this.patientId = event.getPatientId();
        this.medicineItems = event.getItems();

        //Từ medicalHistoryId trong request có appointmentId, sau đó tìm kiến appointmentId trong invoice
        //Labtest.getMedicalHistory(event.getMedicalHistoryId())-->MedicalHistory.getAppointmentId()
        //Invoice.getInvoice(MedicalHistory.getAppointmentId())-->Invoice()
        this.invoiceId = UUID.fromString("3fa85f64-5717-4562-b3fc-2c963f66afa6");

        SagaLifecycle.associateWith("invoiceId", String.valueOf(this.invoiceId));
        this.dispenseOrderId = UUID.randomUUID();


        //xử lý callback (kết quả trả về)
        commandGateway.send(new ReserveMedicineCommand(
                this.dispenseOrderId,
                event.getPrescriptionId(),
                event.getItems()
        )).exceptionally(exception -> {

            //CommandHandler NÉM EXCEPTION
            System.err.println("Saga nhận được lỗi từ Inventory: " + exception.getMessage());

            //Kết thúc Saga ngay lập tức vì chưa làm gì nên không cần Rollback
            SagaLifecycle.end();

            //phát một Event thất bại thủ công tại đây cho Notification Service
            return null;
        });
    }

    // BƯỚC 2: Thuốc đã giữ -> Cộng tiền vào hóa đơn
    @SagaEventHandler(associationProperty = "prescriptionId")
    public void on(MedicineReservedEvent event) {
        commandGateway.send(new AddMedicineChargesCommand(
                this.invoiceId,
                event.getPrescriptionId(),
                this.medicineItems
        ));
    }

    // BƯỚC 3: Tiền đã cộng -> Thẩm định bảo hiểm
    @SagaEventHandler(associationProperty = "prescriptionId")
    public void on(MedicineChargesAddedEvent event) {
        this.insuranceClaimId = UUID.randomUUID();

        commandGateway.send(new ValidateInsuranceCommand(
                this.insuranceClaimId,
                event.getPrescriptionId(),
                this.invoiceId,
                this.patientId,
                event.getInvoiceItemCheckerRequest()
        ));
    }

    // BƯỚC 4: Bảo hiểm OK -> Cập nhật giảm giá vào hóa đơn
    @SagaEventHandler(associationProperty = "prescriptionId")
    public void on(InsuranceValidatedEvent event) {
        this.discountAmount = event.getCoverageAmount();

        commandGateway.send(new ApplyInsuranceDiscountCommand(
                this.invoiceId,
                event.getPrescriptionId(),
                event.getCoverageAmount()
        ));
    }

    @EndSaga
    @SagaEventHandler(associationProperty = "prescriptionId")
    public void on(InsuranceDiscountUpdatedEvent event) {
        System.out.println("SAGA PRE-BILLING HOÀN TẤT: Hóa đơn đã sẵn sàng để thanh toán.");
    }


    //Rollback
    @EndSaga
    @SagaEventHandler(associationProperty = "prescriptionId")
    public void on(MedicineReservationFailedEvent event) {
        //Thông báo cho Notification Service
        System.out.println("SAGA KẾT THÚC: Kiểm tra kho thất bại!");
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
        triggerRollbackInventory(event.getPrescriptionId());
    }

    //Command request for chain
    @SagaEventHandler(associationProperty = "prescriptionId")
    public void on(MedicineChargesRemovedEvent event) {
        log.info("🔄 ROLLBACK PROGRESS: Phí thuốc đã xóa. -> Tiếp tục: Nhả kho (Release Inventory).");
        triggerRollbackInventory(event.getPrescriptionId());
    }


    //Validate Fail
    @SagaEventHandler(associationProperty = "prescriptionId")
    public void on(InsuranceRejectedEvent event) {
        log.warn("🛑 FAILURE (STEP 3): Bảo hiểm từ chối. Lý do: {}. -> Bắt đầu Rollback: Xóa phí thuốc.", event.getReason());
        triggerRollbackCharges(event.getPrescriptionId());
    }

    //Command request for chain
    @SagaEventHandler(associationProperty = "prescriptionId")
    public void on(InsuranceClaimCancelledEvent event) {
        log.info("🔄 ROLLBACK PROGRESS: Claim đã hủy. -> Tiếp tục: Xóa phí thuốc.");
        triggerRollbackCharges(event.getPrescriptionId());
    }

    //Save DB Fail
    @SagaEventHandler(associationProperty = "prescriptionId")
    public void on(InsuranceUpdateFailedEvent event) {
        log.error("🛑 FAILURE (STEP 4): Lỗi cập nhật Invoice DB. Lý do: {}. -> Bắt đầu Rollback: Hủy Claim.", event.getReason());
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
                prescriptionId,
                this.medicineItems
        ));
    }

    private void triggerRollbackInsuranceClaim(UUID prescriptionId){
        commandGateway.send(new CancelInsuranceClaimCommand(
                this.insuranceClaimId,
                prescriptionId,
                "Rollback do lỗi cập nhật hóa đơn: "
        ));
    }

}