package com.main_project.appointment_service.controller;

import com.main_project.appointment_service.dto.AppointmentDTO;
import com.main_project.appointment_service.dto.AppointmentRequestDTO;
import com.main_project.appointment_service.enums.AppointmentStatus;
import com.main_project.appointment_service.service.IAppointmentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
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
@RequestMapping("/appointment-service/appointments")
@RequiredArgsConstructor
public class AppointmentController {

    private final IAppointmentService appointmentService;

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

    @PutMapping("/check-in/{id}")
    @Operation(summary = "Cập nhật CheckIn")
    public ResponseEntity<Void> updateCheckIn(
            @PathVariable UUID id,
            @Valid @RequestBody AppointmentRequestDTO requestDTO) {

        appointmentService.updateCheckIn(
                id.toString(),
                requestDTO.getPatientId().toString()
        );

        return ResponseEntity.noContent().build(); // 204 NO CONTENT
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
        appointmentService.deleteAppointment(id);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/doctor/{doctorId}")
    @Operation(summary = "Xóa lịch hẹn theo bác sĩ")
    public ResponseEntity<Void> deleteByDoctor(@PathVariable UUID doctorId) {
        appointmentService.deleteAppointmentsByDoctorId(doctorId);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/patient/{patientId}")
    @Operation(summary = "Xóa lịch hẹn theo bệnh nhân")
    public ResponseEntity<Void> deleteByPatient(@PathVariable UUID patientId) {
        appointmentService.deleteAppointmentsByPatientId(patientId);
        return ResponseEntity.noContent().build();
    }
}





















