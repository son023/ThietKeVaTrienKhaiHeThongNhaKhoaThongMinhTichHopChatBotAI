package com.main_project.appointment_service.service;

import com.main_project.appointment_service.dto.WorkScheduleDTO;
import com.main_project.appointment_service.dto.WorkScheduleRequestDTO;

import java.time.ZonedDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface IWorkSchedule {
    // 🔹 Lấy tất cả WorkSchedule
    List<WorkScheduleDTO> getAllWorkSchedules();

    // 🔹 Lấy WorkSchedule theo ID
    Optional<WorkScheduleDTO> getWorkScheduleById(UUID id);

    // 🔹 Lọc theo ngày cụ thể
    List<WorkScheduleDTO> getWorkSchedulesByDate(ZonedDateTime date);

    // 🔹 Lọc theo khoảng ngày
    List<WorkScheduleDTO> getWorkSchedulesBetween(ZonedDateTime start, ZonedDateTime end);

    // 🔹 Tạo mới
    WorkScheduleDTO createWorkSchedule(WorkScheduleRequestDTO requestDTO);

    // 🔹 Cập nhật toàn bộ thông tin
    WorkScheduleDTO updateWorkSchedule(UUID id, WorkScheduleRequestDTO requestDTO);

    // 🔹 Cập nhật trạng thái riêng (PATCH)
    WorkScheduleDTO updateWorkScheduleStatus(UUID id, String status);

    // 🔹 Xóa WorkSchedule
    void deleteWorkSchedule(UUID id);
}
