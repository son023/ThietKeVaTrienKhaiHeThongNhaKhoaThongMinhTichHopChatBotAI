package com.main_project.patient_service.aggregate;

import com.do_an.common.command.CreateMedicalHistoryCommand;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.axonframework.commandhandling.CommandHandler;
import org.axonframework.modelling.command.Repository;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class MedicalHistoryCommandHandler {
    private final Repository<MedicalHistoryAggregate> medicalHistoryAggregateRepository;

    @CommandHandler
    public void handle(CreateMedicalHistoryCommand command) throws Exception {
        log.info("Tạo medical history cho appointment {}", command.getAppointmentId());

        medicalHistoryAggregateRepository.newInstance(() -> new MedicalHistoryAggregate(
                command.getClinicalId(),
                command.getAppointmentId(),
                command.getPatientId(),
                command.getMedicalHistoryId()
        ));
    }
}
