package com.main_project.appointment_service.entity;

import com.main_project.appointment_service.enums.AppointmentStatus;
import jakarta.persistence.*;
import lombok.*;
import java.time.ZonedDateTime;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "appointment")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Appointment {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    @Column(nullable = false, name = "doctor_id")
    private UUID doctorId;

    @Column(nullable = false, name = "patient_id")
    private UUID patientId;

    @Column(nullable = false, name = "start_time")
    private ZonedDateTime appointmentStartTime;

    @Column(nullable = false, name = "end_time")
    private ZonedDateTime appointmentEndTime;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 255, name = "status")
    private AppointmentStatus status;

    @Column(nullable = false, name = "created_at")
    private ZonedDateTime createdAt;

    @Column(nullable = false, name = "updated_at")
    private ZonedDateTime updatedAt;

    @OneToMany(mappedBy = "appointment", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<MedicalService> medicalService;
}
