package com.do_an.common.event;

import lombok.Value;

import java.util.UUID;

@Value
public class MedicineReservationFailedEvent {
    UUID prescriptionId;
}
