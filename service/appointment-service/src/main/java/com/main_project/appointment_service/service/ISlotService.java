package com.main_project.appointment_service.service;

import java.time.ZonedDateTime;
import java.util.List;
import java.util.UUID;

public interface ISlotService {
    public List<ZonedDateTime> getAvailableSlots(UUID doctorId, UUID serviceId, ZonedDateTime date);

    boolean lockSlot(UUID doctorId, UUID patientId, ZonedDateTime slotStart);

    void unlockSlot(UUID doctorId, ZonedDateTime slotStart);
    boolean validateAndUnlockSlot(UUID doctorId, UUID patientId, ZonedDateTime slotStart);
}
