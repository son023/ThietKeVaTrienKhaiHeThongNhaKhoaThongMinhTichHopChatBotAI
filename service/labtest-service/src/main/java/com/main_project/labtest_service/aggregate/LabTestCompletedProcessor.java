package com.main_project.labtest_service.aggregate;

import com.do_an.common.event.ServiceChargeAddedEvent;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.axonframework.eventhandling.EventBus;
import org.axonframework.eventhandling.EventHandler;
import org.springframework.stereotype.Component;

import static org.axonframework.eventhandling.GenericEventMessage.asEventMessage;

@Component
@RequiredArgsConstructor
@Slf4j
public class LabTestCompletedProcessor {

    private final EventBus eventBus;

    @EventHandler
    public void on(LabTestCompletedEvent e) {
        log.info("LabTestCompletedEvent received: {}", e);
        eventBus.publish(asEventMessage(
                new ServiceChargeAddedEvent(
                        e.getLabTestId(),
                        e.getAppointmentId(),
                        e.getPrice()
                )
        ));
        log.info("ServiceChargeAddedEvent published for labTestId: {}, appointmentId: {}", 
                e.getLabTestId(), e.getAppointmentId());
        eventBus.publish(asEventMessage(
                new com.do_an.common.event.LabTestCompletedEvent(
                        e.getLabTestId(),
                        e.getAppointmentId(),
                        e.getDoctorId(),
                        e.getPrice()
                )
        ));
        log.info("CommonLabTestCompletedEvent published for labTestId: {}, appointmentId: {}, doctorId: {}", 
                e.getLabTestId(), e.getAppointmentId(), e.getDoctorId());
    }
}
