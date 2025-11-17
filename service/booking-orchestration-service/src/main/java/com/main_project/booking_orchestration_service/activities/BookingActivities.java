package com.main_project.booking_orchestration_service.activities;

import com.main_project.booking_orchestration_service.dto.BookingRequest;
import com.main_project.booking_orchestration_service.grpc.user.GetDoctorContactResponse;
import com.main_project.booking_orchestration_service.grpc.user.ValidatePatientResponse;
import io.temporal.activity.ActivityInterface;

@ActivityInterface
public interface BookingActivities {
    ValidatePatientResponse validatePatient(BookingRequest request);

    // Step 2: Gọi insurance-service
    //void validateInsurance(String insuranceNumber);

    // Step 3: Gọi appointment-service (Giữ Redis)
    void reserveSlot(BookingRequest request);

    // Step 5: Gọi appointment-service (Ghi DB)
    void finalizeBooking(BookingRequest request);

    // Step 6: Lấy contact bác sĩ
    GetDoctorContactResponse getDoctorContact(String doctorId);

    // Step 7: Gửi thông báo
    void sendNotification(GetDoctorContactResponse contact);

    // Compensation cho Step 3
    void compensateSlotReservation(BookingRequest request);

    // Compensation cho Step 5 (Phức tạp, thường là ko đền bù)
     //void compensateFinalBooking(BookingRequest request);

    // Step 4 (Timeout): Hủy
    void cancelBookingTimeout(BookingRequest request);
}
