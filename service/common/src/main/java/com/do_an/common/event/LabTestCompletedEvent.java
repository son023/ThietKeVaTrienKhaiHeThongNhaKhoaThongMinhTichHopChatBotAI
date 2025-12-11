package com.do_an.common.event;

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
    private UUID doctorId;
    private int price;
}