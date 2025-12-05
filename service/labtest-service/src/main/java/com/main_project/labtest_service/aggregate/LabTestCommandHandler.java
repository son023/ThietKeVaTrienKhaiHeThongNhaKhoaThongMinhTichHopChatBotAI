package com.main_project.labtest_service.aggregate;

import com.do_an.common.command.CreateLabTestCommand;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.axonframework.commandhandling.CommandHandler;
import org.axonframework.modelling.command.Repository;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class LabTestCommandHandler {

    private final Repository<LabTestAggregate> labTestAggregateRepository;

    @CommandHandler
    public void handle(RequestLabTestCommand cmd) throws Exception {
        labTestAggregateRepository.newInstance(() -> new LabTestAggregate(cmd));
    }

    @CommandHandler
    public void handle(AcceptLabTestCommand cmd) throws Exception {
        labTestAggregateRepository.load(cmd.getLabTestId().toString())
                .execute(agg -> agg.handle(cmd));
    }

    @CommandHandler
    public void handle(StartLabTestCommand cmd) throws Exception {
        labTestAggregateRepository.load(cmd.getLabTestId().toString())
                .execute(agg -> agg.handle(cmd));
    }

    @CommandHandler
    public void handle(CompleteLabTestCommand cmd) throws Exception {
        labTestAggregateRepository.load(cmd.getLabTestId().toString())
                .execute(agg -> agg.handle(cmd));
    }
}