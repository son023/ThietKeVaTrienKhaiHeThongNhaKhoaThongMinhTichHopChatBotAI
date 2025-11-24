package com.do_an.prescriptionbillingservice.saga;

import com.do_an.common.command.*;
import com.do_an.common.event.*;
import com.do_an.common.model.MedicineItem;
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
public class PrescriptionBillingSaga {

    @Autowired
    private transient CommandGateway commandGateway;

    // Lưu trữ trạng thái tạm thời để dùng cho các bước sau hoặc rollback
    private UUID patientId;
    private UUID invoiceId;
    private UUID dispenseOrderId;
    private UUID insuranceClaimId;

    private UUID paymentId;


    private List<MedicineItem> medicineItems;
    private Integer discountAmount;


    // BƯỚC 1: Bắt đầu -> Gửi lệnh Giữ thuốc (Reserve Medicine)
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

        commandGateway.send(new ReserveMedicineCommand(
                this.dispenseOrderId,
                event.getPrescriptionId(),
                event.getItems()
        ));


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

    // BƯỚC 5: Giảm giá đã cập nhật -> Thực hiện thanh toán
    @EndSaga
    @SagaEventHandler(associationProperty = "prescriptionId")
    public void on(InsuranceDiscountUpdatedEvent event) {
        this.paymentId = UUID.randomUUID();
        System.out.println("SAGA PRE-BILLING HOÀN TẤT: Hóa đơn đã sẵn sàng để thanh toán.");
    }

    // BƯỚC 6: Thanh toán thành công -> Kết thúc
//    @EndSaga
//    @SagaEventHandler(associationProperty = "prescriptionId")
//    public void on(PaymentProcessedEvent event) {
//        System.out.println("SAGA HOÀN TẤT: Kê đơn và thanh toán thành công!");
//    }

    // ----------------------------------------------------------------
    // FAILURE PATH (Luồng Lỗi) - Theo đúng saga.txt
    // ----------------------------------------------------------------

    // Kịch bản Lỗi 1: Thanh toán thất bại (Tại Bước 5)
    // -> Hoàn tác giảm giá bảo hiểm (Rollback Bước 4)
//    @SagaEventHandler(associationProperty = "prescriptionId")
//    public void on(PaymentFailedEvent event) {
//        System.err.println("Thanh toán thất bại. Bắt đầu rollback...");
//        commandGateway.send(new RevertInsuranceDiscountCommand(
//                this.invoiceId,
//                event.getPrescriptionId()
//        ));
//    }


    // Kịch bản Lỗi 2: Cập nhật bảo hiểm thất bại (Tại Bước 4)
    // -> Bắt đầu chuỗi: Cancel Claim -> Remove Charges -> Release Inventory
    @SagaEventHandler(associationProperty = "prescriptionId")
    public void on(InsuranceUpdateFailedEvent event) {

        triggerRollbackCharges(event.getPrescriptionId());
    }

    // Kịch bản Lỗi 3: Thẩm định bảo hiểm từ chối (Tại Bước 3)
    // -> Xóa phí thuốc
    @SagaEventHandler(associationProperty = "prescriptionId")
    public void on(InsuranceRejectedEvent event) {
        triggerRollbackCharges(event.getPrescriptionId());
    }

    // Kịch bản Lỗi 4: Thêm phí thuốc thất bại (Tại Bước 2)
    // -> Nhả thuốc (Rollback Bước 1)

    @EndSaga
    @SagaEventHandler(associationProperty = "prescriptionId")
    public void on(MedicineReservationFailedEvent event) {
        // Tình huống: Inventory báo thành công ảo, Saga đã lỡ tạo Invoice,
        // nhưng sau đó Inventory báo lỗi thật.
        // Kiểm tra xem đã lỡ tạo Invoice chưa?
        if (this.invoiceId != UUID.fromString("3fa85f64-5717-4562-b3fc-2c963f66afa6")) {
            // Nếu đã có Invoice, phải gửi lệnh hủy Invoice
            commandGateway.send(new RemoveMedicineChargesCommand(
                    this.invoiceId,
                    event.getPrescriptionId()
            ));
        }
        // Không cần rollback Inventory vì bản thân Inventory đã thất bại rồi.
        System.out.println("SAGA THẤT BẠI: KIỂM KHO THẤT BẠI!");
    }

    @SagaEventHandler(associationProperty = "prescriptionId")
    public void on(ChargesAdditionFailedEvent event) {
        triggerRollbackInventory(event.getPrescriptionId());
    }

    // ----------------------------------------------------------------
    // COMPENSATION CHAIN (Luồng Bù Trừ)
    // ----------------------------------------------------------------

    // Compensation: Đã hoàn tác giảm giá xong -> Xóa phí thuốc
    @SagaEventHandler(associationProperty = "prescriptionId")
    public void on(InsuranceDiscountRevertedEvent event) {
        triggerRollbackCharges(event.getPrescriptionId());
    }

    // Compensation: Đã xóa phí thuốc xong -> Nhả thuốc
    @SagaEventHandler(associationProperty = "prescriptionId")
    public void on(MedicineChargesRemovedEvent event) {
        triggerRollbackInventory(event.getPrescriptionId());
    }

    // Compensation: Đã nhả thuốc xong -> Kết thúc Saga với lỗi
    @EndSaga
    @SagaEventHandler(associationProperty = "prescriptionId")
    public void on(MedicineReservationReleasedEvent event) {
        System.err.println("SAGA KẾT THÚC: Đã rollback toàn bộ quy trình.");
    }


    // ----------------------------------------------------------------
    // Helper Methods
    // ----------------------------------------------------------------

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

}