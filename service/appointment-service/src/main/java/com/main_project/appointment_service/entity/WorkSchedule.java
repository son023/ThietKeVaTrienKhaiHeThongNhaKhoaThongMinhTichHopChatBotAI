package com.main_project.appointment_service.entity;

import com.fasterxml.jackson.annotation.JsonFormat;
import jakarta.persistence.*;
import lombok.*;
import java.time.ZonedDateTime;
import java.util.UUID;

@Entity
@Table(name = "work_schedule")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class WorkSchedule {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "dd-MM-yyyy")
    @Column(nullable = false)
    private ZonedDateTime workDate;

    @Column(nullable = false)
    private ZonedDateTime startTime;

    @Column(nullable = false)
    private ZonedDateTime endTime;
}