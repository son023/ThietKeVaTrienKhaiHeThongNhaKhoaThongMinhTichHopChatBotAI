package com.main_project.appointment_service.aggregate;

import com.do_an.common.event.AppointmentUpdateStatusEvent;
import com.main_project.appointment_service.enums.AppointmentStatus;
import com.main_project.appointment_service.service.IAppointmentService;
import com.do_an.common.command.AppointmentUpdateStatusCommand;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.axonframework.commandhandling.CommandHandler;
import org.axonframework.eventhandling.EventBus;
import org.axonframework.modelling.command.Repository;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class AppointmentCommandHandler {
    private final IAppointmentService appointmentService;
    private final Repository<AppointmentAggregate> appointmentAggregateRepository;
    private final EventBus eventBus;

    @CommandHandler
    public void handle(AppointmentUpdateStatusCommand command) {
        log.info("Nhận lệnh AppointmentUpdateStatusCommand cho AppointmentId: {}", command.getAppointmentId());
        try {
            appointmentService.updateAppointmentStatus(command.getAppointmentId(), AppointmentStatus.valueOf(command.getStatus()));

            // Thử load aggregate từ repository
            appointmentAggregateRepository.load(command.getAppointmentId().toString())
                    .execute(aggregate -> aggregate.updateStatus(command));

        } catch (org.axonframework.modelling.command.AggregateNotFoundException e) {
            try {
                appointmentAggregateRepository.newInstance(() -> new AppointmentAggregate(command));
            } catch (Exception ex) {
                log.error("Lỗi khi tạo aggregate mới: {}", ex.getMessage(), ex);
            }
        } catch (Exception e) {
            log.error("Lỗi khi cập nhật trạng thái Appointment: {}", e.getMessage(), e);
        }
    }
}
