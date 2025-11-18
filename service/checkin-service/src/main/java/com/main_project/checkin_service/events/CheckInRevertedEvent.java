package com.main_project.checkin_service.events;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CheckInRevertedEvent {

    // ID của Lịch hẹn vừa được hoàn tác
    private UUID appointmentId;
}
