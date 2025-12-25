package com.do_an.common.event;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PrescriptionDispensedEvent {
    private UUID dispenseOrderId;
    private UUID prescriptionId;
    private UUID medicalHistoryId;
    private UUID appointmentId;
    private UUID pharmacistId;
    private String pharmacistName;
    private String message;
}

