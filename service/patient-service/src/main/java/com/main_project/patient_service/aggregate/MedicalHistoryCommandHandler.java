package com.main_project.patient_service.aggregate;

import com.do_an.common.command.AppointmentUpdateStatusCommand;
import com.do_an.common.command.MedicalHistoryCreateCommand;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.axonframework.commandhandling.CommandHandler;
import org.axonframework.eventhandling.EventBus;
import org.axonframework.modelling.command.Repository;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class MedicalHistoryCommandHandler {

}
