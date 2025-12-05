package com.do_an.common.event;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class LabTestCreatedEvent {
    private UUID appointmentId;
    private UUID clinicalId;
    private UUID doctorId;
    private UUID patientId;
    private UUID medicalHistoryId;
    private UUID labTestId;
    private UUID labTestTypeId;
    private Integer price;
    private String instructions;
}

