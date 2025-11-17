package com.main_project.booking_orchestration_service.controller;

import com.main_project.booking_orchestration_service.dto.BookingRequest;
import com.main_project.booking_orchestration_service.starter.BookingWorkflowStarter;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/book-service/appointments")
public class BookingController {
    private final BookingWorkflowStarter starter;

    public BookingController(BookingWorkflowStarter starter) {
        this.starter = starter;
    }

    // Tiêm (inject) service "Starter" (service này sẽ nói chuyện với Temporal)
//    public BookingController(BookingWorkflowStarter starter) {
//        this.starter = starter;
//    }

    /**
     * API 1: Bệnh nhân bắt đầu quá trình (ví dụ: giữ chỗ)
     * Kích hoạt Workflow và bắt đầu chờ 10 phút.
     * Đây là API được gọi khi bệnh nhân đã chọn xong slot và nhấn "Tiếp tục".
     */
    @PostMapping("/start")
//    @Operation(summary = "Bắt đầu luồng đặt lịch (API 1)",
//            description = "Kích hoạt Temporal Workflow. Workflow sẽ chạy nền (gọi gRPC) và chờ xác nhận.")
    public ResponseEntity<String> startBooking(@RequestBody BookingRequest request) {

        // Gọi Starter để bắt đầu Workflow
        starter.startWorkFlow(request);

        // Trả về 200 OK ngay lập tức (Workflow chạy bất đồng bộ)
        return ResponseEntity.ok("Booking workflow started for patient: "
                + request.getPatientId() + ". Waiting for confirmation.");
    }

    /**
     * API 2: Bệnh nhân ấn nút "Hoàn thành" (Confirm)
     * Gửi tín hiệu (Signal) đến Workflow đang chờ (đang await).
     */
    @PostMapping("/confirm")
//    @Operation(summary = "Xác nhận đặt lịch (API 2)",
//            description = "Gửi tín hiệu 'confirm' đến Workflow đang chạy để hoàn tất việc đặt.")
    public ResponseEntity<String> confirmBooking(
            @RequestParam String patientId,
            @RequestParam String slotId) {

        // Gọi Starter để gửi tín hiệu (Signal)
        starter.sendConfirmationSignal(patientId, slotId);

        return ResponseEntity.ok("✅ Booking confirmation signal sent!");
    }
}
