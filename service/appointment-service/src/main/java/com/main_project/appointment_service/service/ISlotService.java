package com.main_project.appointment_service.service;

import java.time.ZonedDateTime;
import java.util.List;
import java.util.UUID;

public interface ISlotService {
    public List<ZonedDateTime> getAvailableSlots(UUID doctorId, UUID serviceId, ZonedDateTime date);
}
