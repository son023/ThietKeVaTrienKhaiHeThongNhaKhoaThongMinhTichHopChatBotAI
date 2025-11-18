package com.main_project.appointment_service.entity;

import com.main_project.appointment_service.enums.DoctorWorkScheduleStatus;
import jakarta.persistence.*;
import lombok.*;

import java.time.ZonedDateTime;
import java.util.UUID;

@Entity
@Table(name = "doctor_work_schedule")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DoctorWorkSchedule {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    @Column(nullable = false, name = "id")
    private UUID id;

    @Column(nullable = false, length = 50)
    private String doctorId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 255)
    private DoctorWorkScheduleStatus status;

    @Column(nullable = false)
    private ZonedDateTime createdAt;

    @Column(nullable = false)
    private ZonedDateTime updatedAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "work_schedule_id", referencedColumnName = "id")
    private WorkSchedule workSchedule;
}
