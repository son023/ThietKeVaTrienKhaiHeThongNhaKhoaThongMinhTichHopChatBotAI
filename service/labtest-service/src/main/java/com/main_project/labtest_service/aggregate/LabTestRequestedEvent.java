package com.main_project.labtest_service.aggregate;

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
    private UUID labTechnicianId;
    private UUID labTestTypeId;
    private int price;
    private String instructions;
}
