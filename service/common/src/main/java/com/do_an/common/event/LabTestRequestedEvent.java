package com.do_an.common.event;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class LabTestRequestedEvent {
    private UUID labTestId;
    private UUID appointmentId;
    private UUID medicalHistoryId;
    private UUID doctorId;
    private UUID labTestTypeId;
    private Integer price;
    private String instructions;
    private String message;
}