package com.main_project.appointment_service.entity;

import com.main_project.appointment_service.enums.AppointmentStatus;
import jakarta.persistence.*;
import lombok.*;
import java.time.ZonedDateTime;
import java.util.UUID;

@Entity
@Table(name = "appointments")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Appointment {

    @Id
    @GeneratedValue
    private UUID id;

    @Column(nullable = false, length = 50)
    private String doctorId;

    @Column(nullable = false, length = 50)
    private String patientId;

    @Column(nullable = false)
    private ZonedDateTime appointmentStartTime;

    @Column(nullable = false)
    private ZonedDateTime appointmentEndTime;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 255)
    private AppointmentStatus status;

    @Column(nullable = false)
    private ZonedDateTime createdAt;

    @Column(nullable = false)
    private ZonedDateTime updatedAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "medical_service_id")
    private MedicalService medicalService;
}
