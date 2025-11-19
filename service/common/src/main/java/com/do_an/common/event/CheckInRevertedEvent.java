package com.do_an.common.event;

import lombok.Value;

@Value
public class CheckInRevertedEvent { // Sự kiện bù trừ 1
    String appointmentId;
}