package com.main_project.appointment_service.repository;

import com.main_project.appointment_service.entity.DoctorWorkSchedule;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.ZonedDateTime;
import java.util.List;
import java.util.UUID;

@Repository
public interface DoctorWorkScheduleRepository extends JpaRepository<DoctorWorkSchedule, UUID> {
    // 🔹 Lấy tất cả lịch làm việc của 1 bác sĩ
    @Query("SELECT dws FROM DoctorWorkSchedule dws WHERE dws.doctorId = :doctorId")
    List<DoctorWorkSchedule> findByDoctorId(@Param("doctorId") UUID doctorId);

    // 🔹 Lấy lịch theo trạng thái
    List<DoctorWorkSchedule> findByStatus(String status);

    // 🔹 Lấy tất cả lịch theo WorkSchedule ID
    List<DoctorWorkSchedule> findByWorkSchedule_Id(UUID workScheduleId);

    // 🔹 Lấy tất cả lịch theo ngày trong WorkSchedule
    List<DoctorWorkSchedule> findByWorkSchedule_WorkDate(ZonedDateTime date);

    // 🔹 Lấy tất cả lịch trong khoảng ngày (truy cập WorkSchedule.date)
    List<DoctorWorkSchedule> findByWorkSchedule_WorkDateBetween(ZonedDateTime start, ZonedDateTime end);

    // 🔹 Lấy tất cả lịch theo WorkSchedule ID
    @Query("SELECT dws FROM DoctorWorkSchedule dws WHERE dws.workSchedule.id = :workScheduleId")
    List<DoctorWorkSchedule> findByWorkScheduleId(@Param("workScheduleId") UUID workScheduleId);

    // 🔹 Lấy lịch làm việc của bác sĩ theo ngày cụ thể
    @Query("SELECT dws FROM DoctorWorkSchedule dws WHERE dws.doctorId = :doctorId AND dws.workSchedule.workDate = :date")
    List<DoctorWorkSchedule> findByDoctorIdAndWorkScheduleDate(@Param("doctorId") UUID doctorId,
                                                               @Param("date") ZonedDateTime date);

    // 🔹 Lấy lịch làm việc trong khoảng thời gian
    @Query("SELECT dws FROM DoctorWorkSchedule dws WHERE dws.doctorId = :doctorId AND dws.workSchedule.workDate BETWEEN :startDate AND :endDate")
    List<DoctorWorkSchedule> findByDoctorIdAndWorkScheduleDateBetween(@Param("doctorId") UUID doctorId,
                                                                      @Param("startDate") ZonedDateTime startDate,
                                                                      @Param("endDate") ZonedDateTime endDate);

    // 🔹 Kiểm tra bác sĩ có lịch làm việc trong ngày không
    @Query("SELECT CASE WHEN COUNT(dws) > 0 THEN true ELSE false END FROM DoctorWorkSchedule dws " +
            "WHERE dws.doctorId = :doctorId AND dws.workSchedule.workDate = :date")
    boolean existsByDoctorIdAndWorkScheduleDate(@Param("doctorId") UUID doctorId,
                                                @Param("date") ZonedDateTime date);

    // 🔹 Đếm số lịch làm việc của bác sĩ
    @Query("SELECT COUNT(dws) FROM DoctorWorkSchedule dws WHERE dws.doctorId = :doctorId")
    long countByDoctorId(@Param("doctorId") UUID doctorId);

    // 🔹 Xóa lịch theo WorkSchedule ID
    @Query("DELETE FROM DoctorWorkSchedule dws WHERE dws.workSchedule.id = :workScheduleId")
    void deleteByWorkScheduleId(@Param("workScheduleId") UUID workScheduleId);

    // 🔹 Xóa lịch của bác sĩ trong ngày cụ thể
    @Query("DELETE FROM DoctorWorkSchedule dws WHERE dws.doctorId = :doctorId AND dws.workSchedule.workDate = :date")
    void deleteByDoctorIdAndWorkScheduleDate(@Param("doctorId") UUID doctorId,
                                             @Param("date") ZonedDateTime date);
}
