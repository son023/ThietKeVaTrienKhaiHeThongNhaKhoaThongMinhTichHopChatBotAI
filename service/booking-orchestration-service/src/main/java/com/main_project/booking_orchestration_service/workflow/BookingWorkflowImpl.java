package com.main_project.booking_orchestration_service.workflow;

import com.main_project.booking_orchestration_service.activities.BookingActivities;
import com.main_project.booking_orchestration_service.dto.BookingRequest;
import com.main_project.booking_orchestration_service.grpc.user.GetDoctorContactResponse;
import com.main_project.booking_orchestration_service.grpc.user.ValidatePatientResponse;
import io.temporal.activity.ActivityOptions;
import io.temporal.common.RetryOptions;
import io.temporal.workflow.Saga;
import io.temporal.workflow.Workflow;
import lombok.extern.slf4j.Slf4j;

import java.time.Duration;

@Slf4j
public class BookingWorkflowImpl implements BookingWorkflow{
    // Trạng thái (Temporal sẽ quản lý)
    private boolean isPatientConfirmed = false;
    private static final int RESERVATION_TIMEOUT_MINUTES = 10; // Giữ chỗ 10 phút

    // Cấu hình Activities (Giống hệt project mẫu)
    private final BookingActivities activities = Workflow.newActivityStub(BookingActivities.class,
            ActivityOptions.newBuilder()
                    // Các Activity (gọi gRPC) nên retry nếu thất bại (vd: network)
                    .setRetryOptions(RetryOptions.newBuilder()
                            .setMaximumAttempts(3)
                            .build())
                    .setStartToCloseTimeout(Duration.ofSeconds(20)) // Tăng timeout cho gRPC
                    .build());

    // Tín hiệu (Signal) khi bệnh nhân ấn "Hoàn thành"
    @Override
    public void sendConfirmationSignal() {
        log.info("📩 Received user confirmation signal.");
        this.isPatientConfirmed = true;
    }

    // Luồng Saga Orchestration
    @Override
    public void startBooking(BookingRequest request) {
        log.info("🚀 Starting booking workflow for: {}", request.getPatientId());

        Saga.Options sagaOptions = new Saga.Options.Builder().setParallelCompensation(false).build();
        Saga saga = new Saga(sagaOptions);

        try {
            // === BẮT ĐẦU SAGA ORCHESTRATION ===

            // Step 1: Validate Patient (gọi Activity gRPC)
            ValidatePatientResponse patientResponse = activities.validatePatient(request);

            // Step 2: Validate Insurance (gọi Activity gRPC)
           // activities.validateInsurance(patientResponse.getInsuranceNumber());

            // Step 3: Giữ chỗ (gọi Activity gRPC)
            activities.reserveSlot(request);
            // ĐĂNG KÝ ĐỀN BÙ: Nếu có lỗi sau bước này, gọi hàm compensateBooking
            saga.addCompensation(() -> activities.compensateSlotReservation(request));

            // Step 4: Chờ xác nhận (Logic "Giữ chỗ 10 phút")
            log.info("⏳ Waiting for user confirmation ({} minutes)...", RESERVATION_TIMEOUT_MINUTES);
            boolean isConfirmed = Workflow.await(
                    Duration.ofMinutes(RESERVATION_TIMEOUT_MINUTES),
                    () -> isPatientConfirmed // Chờ biến này = true
            );

            if (!isConfirmed) {
                log.warn("🛑 User did not confirm in {} minutes.", RESERVATION_TIMEOUT_MINUTES);
                activities.cancelBookingTimeout(request); // Activity này cũng sẽ nhả slot
                // (Không cần throw exception vì chúng ta *muốn* saga kết thúc ở đây)
            } else {
                log.info("✅ User confirmed.");

                // Step 5: Ghi DB (gọi Activity gRPC)
                // Đây là bước cuối cùng, không thể đền bù
                activities.finalizeBooking(request);

                // Step 6 & 7: Gửi thông báo
                GetDoctorContactResponse contact = activities.getDoctorContact(request.getDoctorId());
                activities.sendNotification(contact);
            }

        } catch (Exception e) {
            log.error("❌ Workflow failed: {}. Initiating compensation.", e.getMessage());
            // *** KÍCH HOẠT ĐỀN BÙ (cho Step 3) ***
            saga.compensate();
        }

        log.info("✅ Booking workflow completed for user: {}", request.getPatientId());
    }
}
