package com.do_an.common.event;


import lombok.Value;

@Value
public class MedicalHistoryCreationFailedEvent { // Kích hoạt Rollback 2
    String medicalHistoryId;
    String appointmentId;
}