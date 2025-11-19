package com.main_project.appointment_service.controller;

import com.main_project.appointment_service.dto.WorkScheduleDTO;
import com.main_project.appointment_service.dto.WorkScheduleRequestDTO;
import com.main_project.appointment_service.service.IWorkSchedule;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.ZoneId;
import java.time.ZonedDateTime;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import java.util.Collections;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/appointment-service/work-schedules")
@RequiredArgsConstructor
public class WorkScheduleController {

    private final IWorkSchedule workScheduleService;

    @GetMapping
    @Operation(summary = "Lấy tất cả ca làm việc", description = "Trả về danh sách tất cả các ca làm việc")
    public ResponseEntity<List<WorkScheduleDTO>> getAll() {
        return ResponseEntity.ok(workScheduleService.getAllWorkSchedules());
    }

    @GetMapping("/{id}")
    @Operation(summary = "Lấy ca làm việc theo ID", description = "Trả về ca làm việc với ID cụ thể")
    @Parameter(name = "id", description = "UUID của ca làm việc", required = true)
    public ResponseEntity<WorkScheduleDTO> getById(@PathVariable UUID id) {
        return workScheduleService.getWorkScheduleById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/date")
    @Operation(summary = "Lấy ca làm việc theo ngày", description = "Trả về danh sách ca làm việc trong ngày được chỉ định")
    @Parameter(name = "date", description = "Ngày cần lấy ca làm việc", required = true)
    public ResponseEntity<List<WorkScheduleDTO>> getByDate(@RequestParam("date") String date) {
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
        List<WorkScheduleDTO> schedules = workScheduleService.getWorkSchedulesBetween(startOfDay, endOfDay);

        return ResponseEntity.ok(schedules);
    }

    @GetMapping("/between")
    @Operation(summary = "Lấy ca làm việc trong khoảng thời gian", description = "Trả về danh sách ca làm việc trong khoảng thời gian được chỉ định")
    @Parameter(name = "start", description = "Thời gian bắt đầu", required = true)
    @Parameter(name = "end", description = "Thời gian kết thúc", required = true)
    public ResponseEntity<List<WorkScheduleDTO>> getBetween(
            @RequestParam("start") ZonedDateTime start,
            @RequestParam("end") ZonedDateTime end
    ) {
        return ResponseEntity.ok(workScheduleService.getWorkSchedulesBetween(start, end));
    }

    @PostMapping
    @Operation(summary = "Tạo ca làm việc mới", description = "Tạo một ca làm việc mới với thông tin được cung cấp")
    public ResponseEntity<WorkScheduleDTO> create(@RequestBody WorkScheduleRequestDTO requestDTO) {
        return ResponseEntity.ok(workScheduleService.createWorkSchedule(requestDTO));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Cập nhật ca làm việc", description = "Cập nhật thông tin ca làm việc đã tồn tại")
    @Parameter(name = "id", description = "UUID của ca làm việc cần cập nhật", required = true)
    public ResponseEntity<WorkScheduleDTO> update(
            @PathVariable UUID id,
            @RequestBody WorkScheduleRequestDTO requestDTO
    ) {
        return ResponseEntity.ok(workScheduleService.updateWorkSchedule(id, requestDTO));
    }

    @PatchMapping("/{id}/status")
    @Operation(summary = "Cập nhật trạng thái ca làm việc", description = "Cập nhật chỉ trạng thái của ca làm việc")
    @Parameter(name = "id", description = "UUID của ca làm việc", required = true)
    @Parameter(name = "status", description = "Trạng thái mới", required = true)
    public ResponseEntity<WorkScheduleDTO> updateStatus(
            @PathVariable UUID id,
            @RequestParam("status") String status
    ) {
        return ResponseEntity.ok(workScheduleService.updateWorkScheduleStatus(id, status));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Xóa ca làm việc theo ID", description = "Xóa ca làm việc cụ thể")
    @Parameter(name = "id", description = "UUID của ca làm việc cần xóa", required = true)
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        workScheduleService.deleteWorkSchedule(id);
        return ResponseEntity.noContent().build();
    }
}
