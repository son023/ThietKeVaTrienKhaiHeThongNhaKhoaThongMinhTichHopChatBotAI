package com.main_project.labtest_service.aggregate;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;
@Data
@NoArgsConstructor
@AllArgsConstructor
public class LabTestCompletedEvent {
    private UUID labTestId;
    private UUID appointmentId;
    private int price;
}