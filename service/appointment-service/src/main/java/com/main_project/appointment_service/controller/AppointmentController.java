package com.main_project.appointment_service.controller;

import com.main_project.appointment_service.dto.AppointmentDTO;
import com.main_project.appointment_service.dto.AppointmentRequestDTO;
import com.main_project.appointment_service.enums.AppointmentStatus;
import com.main_project.appointment_service.service.IAppointmentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;

import jakarta.validation.Valid;
import java.time.ZonedDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.springframework.http.HttpStatus.CREATED;

@RestController
@RequestMapping("/api/appointments")
@RequiredArgsConstructor
public class AppointmentController {

    private final IAppointmentService appointmentService;

    // 🔹 Lấy tất cả lịch hẹn
    @GetMapping
    @Operation(summary = "Get all appointments", description = "Retrieve all appointment records")
    public ResponseEntity<List<AppointmentDTO>> getAllAppointments() {
        List<AppointmentDTO> appointments = appointmentService.getAllAppointments();
        return ResponseEntity.ok(appointments);
    }

    // 🔹 Lấy lịch hẹn theo ID
    @GetMapping("/{id}")
    @Operation(summary = "Get appointment by ID", description = "Retrieve a specific appointment by its ID")
    public ResponseEntity<AppointmentDTO> getAppointmentById(
            @Parameter(description = "Appointment ID") @PathVariable UUID id) {
        Optional<AppointmentDTO> appointment = appointmentService.getAppointmentById(id);
        return appointment.map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // 🔹 Lấy danh sách lịch hẹn theo bác sĩ
    @GetMapping("/doctor/{doctorId}")
    @Operation(summary = "Get appointments by doctor ID", description = "Retrieve all appointments assigned to a specific doctor")
    public ResponseEntity<List<AppointmentDTO>> getAppointmentsByDoctorId(
            @Parameter(description = "Doctor ID") @PathVariable UUID doctorId) {
        List<AppointmentDTO> appointments = appointmentService.getAppointmentsByDoctorId(doctorId);
        return ResponseEntity.ok(appointments);
    }

    // 🔹 Lấy danh sách lịch hẹn theo bệnh nhân
    @GetMapping("/patient/{patientId}")
    @Operation(summary = "Get appointments by patient ID", description = "Retrieve all appointments for a specific patient")
    public ResponseEntity<List<AppointmentDTO>> getAppointmentsByPatientId(
            @Parameter(description = "Patient ID") @PathVariable UUID patientId) {
        List<AppointmentDTO> appointments = appointmentService.getAppointmentsByPatientId(patientId);
        return ResponseEntity.ok(appointments);
    }

    // 🔹 Lấy danh sách lịch hẹn theo trạng thái
    @GetMapping("/status/{status}")
    @Operation(summary = "Get appointments by status", description = "Retrieve all appointments by their status")
    public ResponseEntity<List<AppointmentDTO>> getAppointmentsByStatus(
            @Parameter(description = "Appointment Status") @PathVariable AppointmentStatus status) {
        List<AppointmentDTO> appointments = appointmentService.getAppointmentsByStatus(status);
        return ResponseEntity.ok(appointments);
    }

    // 🔹 Lấy lịch hẹn trong 1 ngày cụ thể
    @GetMapping("/date")
    @Operation(summary = "Get appointments by date", description = "Retrieve all appointments scheduled for a specific date")
    public ResponseEntity<List<AppointmentDTO>> getAppointmentsByDate(
            @Parameter(description = "Appointment date (ISO format)") @RequestParam ZonedDateTime date) {
        List<AppointmentDTO> appointments = appointmentService.getAppointmentsByDate(date);
        return ResponseEntity.ok(appointments);
    }

    // 🔹 Lấy lịch hẹn trong khoảng thời gian
    @GetMapping("/range")
    @Operation(summary = "Get appointments in time range", description = "Retrieve appointments between start and end times")
    public ResponseEntity<List<AppointmentDTO>> getAppointmentsBetween(
            @Parameter(description = "Start datetime (ISO format)") @RequestParam ZonedDateTime start,
            @Parameter(description = "End datetime (ISO format)") @RequestParam ZonedDateTime end) {
        List<AppointmentDTO> appointments = appointmentService.getAppointmentsBetween(start, end);
        return ResponseEntity.ok(appointments);
    }

    // 🔹 Đếm số lịch hẹn theo bác sĩ
    @GetMapping("/count/doctor/{doctorId}")
    @Operation(summary = "Count appointments by doctor ID", description = "Get total number of appointments for a specific doctor")
    public ResponseEntity<Long> countAppointmentsByDoctorId(
            @Parameter(description = "Doctor ID") @PathVariable UUID doctorId) {
        long count = appointmentService.countAppointmentsByDoctorId(doctorId);
        return ResponseEntity.ok(count);
    }

    // 🔹 Đếm số lịch hẹn theo bệnh nhân
    @GetMapping("/count/patient/{patientId}")
    @Operation(summary = "Count appointments by patient ID", description = "Get total number of appointments for a specific patient")
    public ResponseEntity<Long> countAppointmentsByPatientId(
            @Parameter(description = "Patient ID") @PathVariable UUID patientId) {
        long count = appointmentService.countAppointmentsByPatientId(patientId);
        return ResponseEntity.ok(count);
    }

    // 🔹 Tạo lịch hẹn mới
    @PostMapping
    @Operation(summary = "Create new appointment", description = "Create a new appointment record")
    public ResponseEntity<AppointmentDTO> createAppointment(
            @Valid @RequestBody AppointmentRequestDTO requestDTO) {
        try {
            AppointmentDTO created = appointmentService.createAppointment(requestDTO);
            return ResponseEntity.status(CREATED).body(created);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    // 🔹 Cập nhật lịch hẹn
    @PutMapping("/{id}")
    @Operation(summary = "Update appointment", description = "Update an existing appointment")
    public ResponseEntity<AppointmentDTO> updateAppointment(
            @Parameter(description = "Appointment ID") @PathVariable UUID id,
            @Valid @RequestBody AppointmentRequestDTO requestDTO) {
        try {
            AppointmentDTO updated = appointmentService.updateAppointment(id, requestDTO);
            return ResponseEntity.ok(updated);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    // 🔹 Cập nhật trạng thái lịch hẹn
    @PatchMapping("/{id}/status")
    @Operation(summary = "Update appointment status", description = "Update the status of an appointment")
    public ResponseEntity<AppointmentDTO> updateAppointmentStatus(
            @Parameter(description = "Appointment ID") @PathVariable UUID id,
            @Parameter(description = "New Status") @RequestParam AppointmentStatus status) {
        try {
            AppointmentDTO updated = appointmentService.updateAppointmentStatus(id, status);
            return ResponseEntity.ok(updated);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    // 🔹 Xóa lịch hẹn
    @DeleteMapping("/{id}")
    @Operation(summary = "Delete appointment", description = "Delete an appointment record by ID")
    public ResponseEntity<Void> deleteAppointment(
            @Parameter(description = "Appointment ID") @PathVariable UUID id) {
        try {
            appointmentService.deleteAppointment(id);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
}





















