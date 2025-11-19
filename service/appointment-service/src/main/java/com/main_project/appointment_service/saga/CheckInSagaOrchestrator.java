package com.main_project.appointment_service.saga;

import com.do_an.common.command.CreateMedicalHistoryCommand;
import com.do_an.common.command.CreatePreInvoiceCommand;
import com.do_an.common.command.DeletePreInvoiceCommand;
import com.do_an.common.event.*;
import org.axonframework.commandhandling.gateway.CommandGateway;
import org.axonframework.modelling.saga.EndSaga;
import org.axonframework.modelling.saga.SagaEventHandler;
import org.axonframework.modelling.saga.SagaLifecycle;
import org.axonframework.modelling.saga.StartSaga;
import org.axonframework.spring.stereotype.Saga;
import org.springframework.beans.factory.annotation.Autowired;

import java.util.UUID;

@Saga
public class CheckInSagaOrchestrator {

    @Autowired
    private transient CommandGateway commandGateway;

    // Biến tạm để lưu trữ ID cho việc bù trừ
    private String appointmentId;
    private String patientId;
    private String invoiceId;

    // 1. BẮT ĐẦU SAGA: Khi Bước 1 (AppointmentService.updateCheckIn) thành công
    @StartSaga
    @SagaEventHandler(associationProperty = "appointmentId")
    public void on(AppointmentCheckedInEvent event) {
        System.out.println("SAGA BẮT ĐẦU: Check-in hoàn tất cho appointment " + event.getAppointmentId());

        this.appointmentId = event.getAppointmentId();
        this.patientId = event.getPatientId();
        this.invoiceId = UUID.randomUUID().toString(); // Tạo ID cho hóa đơn

        // Liên kết Saga này với 'invoiceId' để nhận phản hồi
        SagaLifecycle.associateWith("invoiceId", this.invoiceId);

        // Gửi Lệnh cho Bước 2: InvoiceService.createPreInvoice
        commandGateway.send(new CreatePreInvoiceCommand(
                this.invoiceId,
                event.getAppointmentId(),
                event.getPatientId()
        ));
    }

    // 2. XỬ LÝ BƯỚC 2: Khi InvoiceService.createPreInvoice thành công
    @SagaEventHandler(associationProperty = "invoiceId")
    public void on(PreInvoiceCreatedEvent event) {
        System.out.println("SAGA BƯỚC 2: Hóa đơn tạm tính OK " + event.getInvoiceId());

        String medicalHistoryId = UUID.randomUUID().toString();

        // Liên kết Saga với 'medicalHistoryId' để nhận phản hồi
        SagaLifecycle.associateWith("medicalHistoryId", medicalHistoryId);

        // Gửi Lệnh cho Bước 3: LabtestService.createMedicalHistory
        commandGateway.send(new CreateMedicalHistoryCommand(
                medicalHistoryId,
                event.getAppointmentId(),
                this.patientId
        ));
    }

    // 3. KẾT THÚC SAGA (HAPPY PATH): Khi LabtestService.createMedicalHistory thành công
    @EndSaga
    @SagaEventHandler(associationProperty = "medicalHistoryId")
    public void on(MedicalHistoryCreatedEvent event) {
        System.out.println("SAGA HOÀN TẤT: Check-in thành công. Appointment " + event.getAppointmentId());
    }

    // -----------------------------------------------------------------
    // XỬ LÝ BÙ TRỪ (SAD PATH)
    // -----------------------------------------------------------------

    // KỊCH BẢN LỖI 1: Lỗi tại Bước 2 (InvoiceService.createPreInvoice thất bại)
    @EndSaga
    @SagaEventHandler(associationProperty = "invoiceId")
    public void on(PreInvoiceCreationFailedEvent event) {
        System.err.println("SAGA LỖI BƯỚC 2: Tạo hóa đơn thất bại " + event.getInvoiceId());
        // Không cần rollback bước 1 theo yêu cầu
        // Saga kết thúc với lỗi
    }

    // KỊCH BẢN LỖI 2: Lỗi tại Bước 3 (LabtestService.createMedicalHistory thất bại)
    // Chỉ rollback Bước 2 (InvoiceService.deletePreInvoice) - KHÔNG rollback Bước 1
    @SagaEventHandler(associationProperty = "medicalHistoryId")
    public void on(MedicalHistoryCreationFailedEvent event) {
        System.err.println("SAGA LỖI BƯỚC 3: Tạo bệnh sử thất bại " + event.getMedicalHistoryId());

        // Chỉ Rollback Bước 2: InvoiceService.deletePreInvoice
        // Sử dụng 'this.invoiceId' đã lưu trước đó
        commandGateway.send(new DeletePreInvoiceCommand(this.invoiceId));
    }

    // KẾT THÚC SAGA sau khi đã rollback Bước 2
    @EndSaga
    @SagaEventHandler(associationProperty = "invoiceId")
    public void on(PreInvoiceDeletedEvent event) {
        System.err.println("SAGA KẾT THÚC: Đã rollback hóa đơn tạm tính " + event.getInvoiceId());
    }
}
