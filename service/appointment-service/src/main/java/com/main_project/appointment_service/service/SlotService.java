package com.main_project.appointment_service.service;

import com.main_project.appointment_service.entity.Appointment;
import com.main_project.appointment_service.entity.MedicalService;
import com.main_project.appointment_service.repository.AppointmentRepository;
import com.main_project.appointment_service.repository.MedicalServiceRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.ZonedDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class SlotService implements ISlotService {

    private final AppointmentRepository appointmentRepository;
    private final MedicalServiceRepository medicalServiceRepository;

    @Override
    public List<ZonedDateTime> getAvailableSlots(UUID doctorId, UUID serviceId, ZonedDateTime date) {
        MedicalService service = medicalServiceRepository.findById(serviceId)
                .orElseThrow(() -> new RuntimeException("Service not found"));
        int serviceTime = service.getServiceTime();

        // giờ làm việc bác sĩ (ví dụ 7h-17h)
        ZonedDateTime workStart = date.withHour(7).withMinute(0).withSecond(0).withNano(0);
        ZonedDateTime workEnd = date.withHour(17).withMinute(0).withSecond(0).withNano(0);

        List<Appointment> appointments = appointmentRepository
                .findByDoctorIdAndStartTimeBetween(doctorId, workStart, workEnd);

        // chia slot 10 phút
        int slotStep = 10;
        List<ZonedDateTime> slots = new ArrayList<>();
        ZonedDateTime slotStart = workStart;

        while (!slotStart.plusMinutes(serviceTime).isAfter(workEnd)) {
            ZonedDateTime slotEnd = slotStart.plusMinutes(serviceTime);
            ZonedDateTime finalSlotStart = slotStart;
            boolean conflict = appointments.stream().anyMatch(a ->
                    !(slotEnd.isEqual(a.getAppointmentStartTime()) || slotEnd.isBefore(a.getAppointmentStartTime())
                            || a.getAppointmentEndTime().isEqual(finalSlotStart) || a.getAppointmentEndTime().isBefore(finalSlotStart))
            );
            if (!conflict) {
                slots.add(slotStart);
            }
            slotStart = slotStart.plusMinutes(slotStep);
        }
        return slots;
    }
}
