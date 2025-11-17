package com.main_project.booking_orchestration_service.dto;

import lombok.Data;

@Data
public class BookingRequest {
    private String patientId;
    private String doctorWorkScheduleId; // (slotId)
    private String doctorId;
    private String notes;
}
