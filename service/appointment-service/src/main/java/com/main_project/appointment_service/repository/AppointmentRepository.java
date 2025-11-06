package com.main_project.appointment_service.repository;

import com.main_project.appointment_service.entity.Appointment;
import com.main_project.appointment_service.enums.AppointmentStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.ZonedDateTime;
import java.util.List;
import java.util.UUID;

public interface AppointmentRepository extends JpaRepository<Appointment, UUID> {
    // Lấy tất cả lịch hẹn theo bác sĩ
    @Query("SELECT a FROM Appointment a WHERE a.doctorId = :doctorId")
    List<Appointment> findByDoctorId(@Param("doctorId") UUID doctorId);

    // Lấy tất cả lịch hẹn theo bệnh nhân
    @Query("SELECT a FROM Appointment a WHERE a.patientId = :patientId")
    List<Appointment> findByPatientId(@Param("patientId") UUID patientId);

    // Lấy lịch hẹn theo trạng thái
    @Query("SELECT a FROM Appointment a WHERE a.status = :status")
    List<Appointment> findByStatus(@Param("status") AppointmentStatus status);

    // Lấy lịch hẹn trong khoảng thời gian
    @Query("SELECT a FROM Appointment a WHERE a.appointmentStartTime BETWEEN :start AND :end")
    List<Appointment> findByAppointmentStartTimeBetween(@Param("start") ZonedDateTime start,
                                                        @Param("end") ZonedDateTime end);

    // Lấy lịch hẹn có chứa dịch vụ y tế cụ thể
    // Vì Appointment có List<MedicalService>, cần JOIN
    @Query("SELECT DISTINCT a FROM Appointment a JOIN a.medicalService m WHERE m.id = :medicalServiceId")
    List<Appointment> findByMedicalServiceId(@Param("medicalServiceId") UUID medicalServiceId);

    // Đếm số lượng lịch hẹn theo bác sĩ
    @Query("SELECT COUNT(a) FROM Appointment a WHERE a.doctorId = :doctorId")
    long countByDoctorId(@Param("doctorId") UUID doctorId);

    // Đếm số lượng lịch hẹn theo bệnh nhân
    @Query("SELECT COUNT(a) FROM Appointment a WHERE a.patientId = :patientId")
    long countByPatientId(@Param("patientId") UUID patientId);

    // Đếm số lượng lịch hẹn có chứa dịch vụ y tế cụ thể
    @Query("SELECT COUNT(DISTINCT a) FROM Appointment a JOIN a.medicalService m WHERE m.id = :medicalServiceId")
    long countByMedicalServiceId(@Param("medicalServiceId") UUID medicalServiceId);

    // Xóa tất cả lịch hẹn theo bác sĩ
    void deleteByDoctorId(UUID doctorId);

    // Xóa tất cả lịch hẹn theo bệnh nhân
    void deleteByPatientId(UUID patientId);
}
