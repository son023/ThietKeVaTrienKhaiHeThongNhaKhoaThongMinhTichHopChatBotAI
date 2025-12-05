package com.main_project.labtest_service.aggregate;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;
@NoArgsConstructor
@Data
@AllArgsConstructor
public class LabTestAcceptedEvent {
    private UUID labTestId;
}