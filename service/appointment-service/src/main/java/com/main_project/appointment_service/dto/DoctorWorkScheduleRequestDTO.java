package com.main_project.appointment_service.dto;

import com.main_project.appointment_service.entity.WorkSchedule;
import com.main_project.appointment_service.enums.DoctorWorkScheduleStatus;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalTime;
import java.time.ZonedDateTime;
import java.util.List;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Data
public class DoctorWorkScheduleRequestDTO {
    private String doctorId;
    private DoctorWorkScheduleStatus status;
    private ZonedDateTime createdAt;
    private ZonedDateTime updatedAt;
    private UUID workScheduleId;
}