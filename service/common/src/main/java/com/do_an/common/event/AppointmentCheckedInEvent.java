package com.do_an.common.event;

import lombok.Value;

@Value

public class AppointmentCheckedInEvent { // Kích hoạt Saga (Bắt đầu Bước 1)
    String appointmentId;
    String patientId;
}