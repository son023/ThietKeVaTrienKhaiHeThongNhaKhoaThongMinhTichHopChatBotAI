package com.main_project.appointment_service.controller;

import com.main_project.appointment_service.dto.AppointmentDTO;
import com.main_project.appointment_service.dto.AppointmentRequestDTO;
import com.main_project.appointment_service.dto.HoldSlotRequestDTO;
import com.main_project.appointment_service.enums.AppointmentStatus;
import com.main_project.appointment_service.service.AppointmentService;

import com.main_project.appointment_service.service.SlotService;
import jakarta.persistence.EntityNotFoundException;
import jakarta.ws.rs.GET;
import lombok.RequiredArgsConstructor;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;

import jakarta.validation.Valid;

import java.time.LocalDate;
import java.time.ZoneId;
import java.time.ZonedDateTime;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import java.util.*;

import static org.springframework.http.HttpStatus.CREATED;

@RestController
@RequestMapping("/appointment-service/appointments")
@RequiredArgsConstructor
public class AppointmentController {

    private final AppointmentService appointmentService;
    private final SlotService slotService;

    @PostMapping("/slots/hold")
    @Operation(summary = "Giữ slot trong 10 phút trước khi tạo lịch hẹn")
    public ResponseEntity<?> holdSlot(@RequestBody HoldSlotRequestDTO request) {

        boolean locked = slotService.lockSlot(
                request.getDoctorId(),
                request.getPatientId(),
                request.getAppointmentStartTime()
        );

        if (!locked) {
            return ResponseEntity.badRequest().body("Slot đã được giữ bởi người khác, vui lòng chọn slot khác");
        }

        // Có thể trả thêm expiredAt = now + 10 phút cho FE đếm ngược
        return ResponseEntity.ok().build();
    }

    @GetMapping
    @Operation(summary = "Lấy tất cả lịch hẹn")
    public ResponseEntity<List<AppointmentDTO>> getAllAppointments() {
        return ResponseEntity.ok(appointmentService.getAllAppointments());
    }

    @GetMapping("/{id}")
    @Operation(summary = "Lấy lịch hẹn theo ID")
    public ResponseEntity<AppointmentDTO> getAppointmentById(@PathVariable UUID id) {
        Optional<AppointmentDTO> dto = appointmentService.getAppointmentById(id);
        return dto.map(ResponseEntity::ok).orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/doctor/{doctorId}")
    @Operation(summary = "Lấy lịch hẹn theo bác sĩ")
    public ResponseEntity<List<AppointmentDTO>> getAppointmentsByDoctorId(@PathVariable UUID doctorId) {
        return ResponseEntity.ok(appointmentService.getAppointmentsByDoctorId(doctorId));
    }

    @GetMapping("/patient/{patientId}")
    @Operation(summary = "Lấy lịch hẹn theo bệnh nhân")
    public ResponseEntity<List<AppointmentDTO>> getAppointmentsByPatientId(@PathVariable UUID patientId) {
        return ResponseEntity.ok(appointmentService.getAppointmentsByPatientId(patientId));
    }

    @GetMapping("/status/{status}")
    @Operation(summary = "Lấy lịch hẹn theo trạng thái")
    public ResponseEntity<List<AppointmentDTO>> getAppointmentsByStatus(@PathVariable AppointmentStatus status) {
        return ResponseEntity.ok(appointmentService.getAppointmentsByStatus(status));
    }

    @GetMapping("/range")
    @Operation(summary = "Lấy lịch hẹn trong khoảng thời gian")
    public ResponseEntity<List<AppointmentDTO>> getAppointmentsBetween(
            @RequestParam ZonedDateTime start,
            @RequestParam ZonedDateTime end) {
        return ResponseEntity.ok(appointmentService.getAppointmentsBetween(start, end));
    }

    @GetMapping("/date")
    @Operation(summary = "Lấy lịch hẹn theo ngày (dd/mm/yyyy)", description = "Trả về danh sách ca làm việc trong ngày được chỉ định")
    @Parameter(name = "date", description = "Ngày cần lấy ca làm việc", required = true)
    public ResponseEntity<List<AppointmentDTO>> getByDate(@RequestParam("date") String date) {
        // 1. Parse String "dd/MM/yyyy" → LocalDate
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd/MM/yyyy");
        LocalDate localDate;
        try {
            localDate = LocalDate.parse(date, formatter);
        } catch (DateTimeParseException ex) {
            return ResponseEntity.badRequest()
                    .body(Collections.emptyList()); // hoặc trả lỗi chi tiết
        }

        // 2. Chuyển LocalDate → ZonedDateTime start-of-day và end-of-day
        ZonedDateTime startOfDay = localDate.atStartOfDay(ZoneId.systemDefault());
        ZonedDateTime endOfDay   = localDate.atTime(23, 59, 59).atZone(ZoneId.systemDefault());

        // 3. Gọi service (service dùng repository query ZonedDateTime)
        List<AppointmentDTO> appointments = appointmentService.getAppointmentsBetween(startOfDay, endOfDay);

        return ResponseEntity.ok(appointments);
    }

    @PostMapping
    @Operation(summary = "Tạo lịch hẹn mới")
    public ResponseEntity<AppointmentDTO> createAppointment(@Valid @RequestBody AppointmentRequestDTO requestDTO) {
        AppointmentDTO created = appointmentService.createAppointment(requestDTO);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @PutMapping("/{id}")
    @Operation(summary = "Cập nhật lịch hẹn")
    public ResponseEntity<AppointmentDTO> updateAppointment(
            @PathVariable UUID id,
            @Valid @RequestBody AppointmentRequestDTO requestDTO) {
        AppointmentDTO updated = appointmentService.updateAppointment(id, requestDTO);
        return ResponseEntity.ok(updated);
    }

    @PatchMapping("/{id}/status")
    @Operation(summary = "Cập nhật trạng thái lịch hẹn")
    public ResponseEntity<AppointmentDTO> updateStatus(
            @PathVariable UUID id,
            @RequestParam AppointmentStatus status) {
        return ResponseEntity.ok(appointmentService.updateAppointmentStatus(id, status));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Xóa lịch hẹn theo ID")
    public ResponseEntity<Void> deleteAppointment(@PathVariable UUID id) {
        try {
            appointmentService.deleteAppointment(id);
            return ResponseEntity.noContent().build(); // 204 OK
        } catch (EntityNotFoundException ex) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build(); // 404
        } catch (DataIntegrityViolationException ex) {
            return ResponseEntity.status(HttpStatus.CONFLICT).build(); // 409
        } catch (Exception ex) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build(); // 500
        }
    }



}





















