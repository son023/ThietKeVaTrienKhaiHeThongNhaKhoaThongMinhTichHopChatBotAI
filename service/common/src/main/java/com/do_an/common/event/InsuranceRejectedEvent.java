package com.do_an.common.event;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.Value;

import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class InsuranceRejectedEvent {
    private UUID patientId;
    private UUID prescriptionId;
    private String reason;
}
