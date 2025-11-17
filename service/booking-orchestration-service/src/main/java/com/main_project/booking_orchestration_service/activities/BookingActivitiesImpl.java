package com.main_project.booking_orchestration_service.activities;

import com.example.booking_orchestration_service.grpc.appointment.AppointmentServiceGrpc;
import com.example.booking_orchestration_service.grpc.appointment.CompensateBookingRequest;
import com.example.booking_orchestration_service.grpc.appointment.FinalizeBookingRequest;
import com.example.booking_orchestration_service.grpc.appointment.ReserveSlotRequest;
import com.main_project.booking_orchestration_service.dto.BookingRequest;
import com.main_project.booking_orchestration_service.grpc.user.*;
import io.grpc.StatusRuntimeException;
import lombok.extern.slf4j.Slf4j;
import net.devh.boot.grpc.client.inject.GrpcClient;
import org.springframework.stereotype.Component;

@Component // Đánh dấu là Spring Bean
@Slf4j
public class BookingActivitiesImpl implements BookingActivities {

    // --- Tiêm (Inject) tất cả các gRPC Stubs ---
    @GrpcClient("user-service")
    private UserServiceGrpc.UserServiceBlockingStub userStub;

//    @GrpcClient("insurance-service")
//    private InsuranceServiceGrpc.InsuranceServiceBlockingStub insuranceStub;

    @GrpcClient("appointment-service")
    private AppointmentServiceGrpc.AppointmentServiceBlockingStub appointmentStub;

    // @GrpcClient("notification-service")
    // private NotificationServiceGrpc.NotificationServiceBlockingStub notificationStub;

    @Override
    public ValidatePatientResponse validatePatient(BookingRequest request) {
        log.info("Activity: Validating patient (gRPC)...");
        try {
            ValidatePatientRequest r = ValidatePatientRequest.newBuilder()
                    .setPatientId(request.getPatientId()).build();
            ValidatePatientResponse res = userStub.validatePatient(r);
//            if (!res.getIsActive()) {
//                throw new RuntimeException("Bệnh nhân không hoạt động.");
//            }
            log.info("Activity: Patient VALID.");
            return res;
        } catch (StatusRuntimeException e) {
            log.error("Activity FAILED (user-service): {}", e.getStatus());
            throw new RuntimeException("Lỗi gRPC: " + e.getStatus());
        }
    }

//    @Override
//    public void validateInsurance(String insuranceNumber) {
//        log.info("Activity: Validating insurance (gRPC)...");
//        try {
//            InsuranceStatusRequest r = InsuranceStatusRequest.newBuilder()
//                    .setInsuranceNumber(insuranceNumber).build();
//            InsuranceStatusResponse res = insuranceStub.checkStatusByNumber(r);
//            if (!"ACTIVE".equals(res.getStatus())) {
//                throw new RuntimeException("Bảo hiểm không hợp lệ.");
//            }
//            log.info("Activity: Insurance VALID.");
//        } catch (StatusRuntimeException e) {
//            log.error("Activity FAILED (insurance-service): {}", e.getStatus());
//            throw new RuntimeException("Lỗi gRPC: " + e.getStatus());
//        }
//    }
//
    @Override
    public void reserveSlot(BookingRequest request) {
        log.info("Activity: Reserving slot (gRPC)...");
        try {
            ReserveSlotRequest r = ReserveSlotRequest.newBuilder()
                    .setSlotId(request.getDoctorWorkScheduleId())
                    .setPatientId(request.getPatientId())
                    .build();
            appointmentStub.reserveSlot(r); // Gọi gRPC đến appointment-service
            log.info("Activity: Slot RESERVED.");
        } catch (StatusRuntimeException e) {
            log.error("Activity FAILED (appointment-service/reserveSlot): {}", e.getStatus());
            throw new RuntimeException("Lỗi gRPC (Reserve Slot): " + e.getStatus());
        }
    }

    @Override
    public void finalizeBooking(BookingRequest request) {
        log.info("Activity: Finalizing booking (gRPC)...");
        try {
            FinalizeBookingRequest r = FinalizeBookingRequest.newBuilder()
                    .setSlotId(request.getDoctorWorkScheduleId())
                    .setPatientId(request.getPatientId())
                    .setDoctorId(request.getDoctorId())
                    .setNotes(request.getNotes() != null ? request.getNotes() : "")
                    .build();
            appointmentStub.finalizeBooking(r); // Gọi gRPC đến appointment-service
            log.info("Activity: Booking FINALIZED.");
        } catch (StatusRuntimeException e) {
            // Lỗi này (ví dụ: hết hạn Redis) sẽ kích hoạt saga.compensate()
            log.error("Activity FAILED (appointment-service/finalizeBooking): {}", e.getStatus());
            throw new RuntimeException("Lỗi gRPC (Finalize Booking): " + e.getStatus());
        }
    }

    @Override
    public GetDoctorContactResponse getDoctorContact(String doctorId) {
        log.info("Activity: Getting doctor contact (gRPC)...");
        try {
            GetDoctorContactRequest r = GetDoctorContactRequest.newBuilder().setDoctorId(doctorId).build();
            return userStub.getDoctorContact(r);
        } catch (StatusRuntimeException e) {
            log.error("Activity FAILED (user-service/getDoctorContact): {}", e.getStatus());
            throw new RuntimeException("Lỗi gRPC: " + e.getStatus());
        }
    }

    @Override
    public void sendNotification(GetDoctorContactResponse contact) {
        log.info("Activity: Sending notification to {}...", contact.getEmail());
        // ... (gọi gRPC notificationStub.sendNotification)
    }

    @Override
    public void compensateSlotReservation(BookingRequest request) {
        log.warn("🛑 COMPENSATION: Releasing slot (gRPC)...");
        try {
            CompensateBookingRequest r = CompensateBookingRequest.newBuilder()
                    .setSlotId(request.getDoctorWorkScheduleId())
                    .build();
            appointmentStub.compensateBooking(r); // Gọi gRPC đền bù
        } catch (Exception e) {
            log.error("🛑 CRITICAL: COMPENSATION FAILED! {}", e.getMessage());
            // (Cần cơ chế retry hoặc báo động admin ở đây)
        }
    }

    @Override
    public void cancelBookingTimeout(BookingRequest request) {
        log.warn("🛑 TIMEOUT: Cancelling booking...");
        // Khi timeout, chúng ta cũng phải nhả slot
        compensateSlotReservation(request);
    }
}
