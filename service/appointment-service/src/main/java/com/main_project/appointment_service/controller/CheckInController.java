package com.main_project.appointment_service.controller;

import com.main_project.appointment_service.api.command.CheckInCommand;
import com.main_project.appointment_service.dto.CheckInDTO;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.axonframework.commandhandling.gateway.CommandGateway;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.web.bind.annotation.*;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/appointment-service")
@Tag(name = "Check-In", description = "Quản lý quy trình Check-in bệnh nhân")
public class CheckInController {
    @Autowired
    private SimpMessagingTemplate simpMessagingTemplate;

    private final CommandGateway commandGateway;

    public CheckInController(CommandGateway commandGateway) {
        this.commandGateway = commandGateway;
    }

    // === API 1: Thực hiện Check-in ===
    @PostMapping("/{appointmentId}")
    @CrossOrigin(origins = "http://localhost:3000") // Cho phép React gọi
    @Operation(summary = "Perform Check-in for an Appointment")
    public ResponseEntity<Map<String, String>> checkIn(@PathVariable String appointmentId,
                                                       @Valid @RequestBody CheckInDTO dto) {

        // Tạo Command (Lấy class từ core-api)
        CheckInCommand command = new CheckInCommand(appointmentId, dto.getPatientId());

        // Gửi Command đi và chờ (để đảm bảo Aggregate xử lý xong bước 1)
        commandGateway.sendAndWait(command);

        Map<String, String> response = new HashMap<>();
        response.put("appointmentId", appointmentId);
        response.put("status", "CHECK_IN_STARTED");
        response.put("message", "Yêu cầu check-in đã được gửi và đang xử lý.");

        return ResponseEntity.ok(response);
    }

    // === API 2: Cập nhật trạng thái & Bắn thông báo Socket ===
    // API này thường được gọi bởi Saga hoặc EventHandler khi quy trình hoàn tất/thất bại
    @PostMapping("/{appointmentId}/status")
    public String updateCheckInStatus(@PathVariable String appointmentId,
                                      @RequestParam String status,
                                      @RequestParam(required = false) String message) {

        // Topic ví dụ: /topic/checkin/appt-123
        String destination = "/topic/checkin/" + appointmentId;

        if ("COMPLETED".equalsIgnoreCase(status)) {
            // Check-in & Tạo hồ sơ bệnh án thành công
            simpMessagingTemplate.convertAndSend(destination,
                    "Check-in thành công! Hồ sơ bệnh án đã được tạo. " + (message != null ? message : ""));
        }
        else if ("CANCELLED".equalsIgnoreCase(status) || "FAILED".equalsIgnoreCase(status)) {
            // Có lỗi xảy ra (Saga rollback)
            simpMessagingTemplate.convertAndSend(destination,
                    "Check-in thất bại! Đã hoàn tác trạng thái. Lỗi: " + (message != null ? message : "Unknown error"));
        }

        return "Check-in status update sent to WebSocket!";
    }
}
