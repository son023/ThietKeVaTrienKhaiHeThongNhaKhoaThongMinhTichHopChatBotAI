package com.do_an.common.event;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class InvoicePersistedEvent {
    private UUID clinicalId;
    private UUID appointmentId;
    private UUID patientId;
    private UUID medicalHistoryId;
    private UUID invoiceId;
}





