package com.main_project.appointment_service.repository;

import com.main_project.appointment_service.entity.WorkSchedule;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.ZonedDateTime;
import java.util.List;
import java.util.UUID;

@Repository
public interface WorkScheduleRepository extends JpaRepository<WorkSchedule, UUID> {
    // 🔹 Lấy tất cả lịch làm việc trong một ngày cụ thể
    @Query("SELECT w FROM WorkSchedule w WHERE w.workDate = :date")
    List<WorkSchedule> findByWorkDate(@Param("date") ZonedDateTime date);

    // 🔹 Lấy tất cả lịch làm việc trong một khoảng ngày
    @Query("SELECT w FROM WorkSchedule w WHERE w.workDate BETWEEN :startDate AND :endDate")
    List<WorkSchedule> findByWorkDateBetween(@Param("startDate") ZonedDateTime startDate,
                                             @Param("endDate") ZonedDateTime endDate);

    // 🔹 Kiểm tra xem đã có lịch trong ngày chưa (để tránh trùng)
    @Query("SELECT CASE WHEN COUNT(w) > 0 THEN true ELSE false END FROM WorkSchedule w WHERE w.workDate = :date")
    boolean existsByWorkDate(@Param("date") ZonedDateTime date);

    // 🔹 Đếm số lượng lịch làm việc trong ngày
    @Query("SELECT COUNT(w) FROM WorkSchedule w WHERE w.workDate = :date")
    long countByWorkDate(@Param("date") ZonedDateTime date);
}
