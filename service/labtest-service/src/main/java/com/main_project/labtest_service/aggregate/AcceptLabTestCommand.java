package com.main_project.labtest_service.aggregate;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.axonframework.modelling.command.TargetAggregateIdentifier;

import java.util.UUID;
@NoArgsConstructor
@Data
@AllArgsConstructor
public class AcceptLabTestCommand {
    @TargetAggregateIdentifier
    private UUID labTestId;
}