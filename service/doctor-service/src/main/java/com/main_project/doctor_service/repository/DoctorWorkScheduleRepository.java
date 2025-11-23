package com.main_project.doctor_service.repository;

import com.main_project.doctor_service.entity.DoctorWorkSchedule;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface DoctorWorkScheduleRepository extends JpaRepository<DoctorWorkSchedule, String> {
    List<DoctorWorkSchedule> findByDoctor_UserId(String doctorId);
    List<DoctorWorkSchedule> findByWorkSchedule_Id(String workScheduleId);
}
