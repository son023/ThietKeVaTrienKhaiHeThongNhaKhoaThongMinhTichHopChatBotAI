package com.do_an.common.event;

import lombok.Value;

@Value
public class MedicalHistoryCreatedEvent { // Kích hoạt Kết thúc Saga
    String medicalHistoryId;
    String appointmentId;
}
