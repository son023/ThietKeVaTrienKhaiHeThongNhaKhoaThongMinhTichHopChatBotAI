package com.main_project.appointment_service.api.events;

import com.main_project.appointment_service.entity.Appointment;
import com.main_project.appointment_service.enums.AppointmentStatus;
import com.main_project.appointment_service.repository.AppointmentRepository;
import org.axonframework.eventhandling.EventHandler;
import org.springframework.stereotype.Component;

@Component
public class CheckInEventHandler {
    private final AppointmentRepository appointmentRepository;

    public CheckInEventHandler(AppointmentRepository appointmentRepository) {
        this.appointmentRepository = appointmentRepository;
    }

    @EventHandler
    public void on(AppointmentCheckedInEvent event) {
//        Appointment appointment = appointmentRepository.findByAppointmentId(event.getAppointmentId());
//        if (appointment != null) {
//            appointment.setStatus(AppointmentStatus.CHECKED);
//            appointmentRepository.save(appointment);
//        }
    }
}
