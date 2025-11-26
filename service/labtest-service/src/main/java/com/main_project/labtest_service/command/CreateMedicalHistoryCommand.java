package com.main_project.labtest_service.command;

import lombok.Data;
import org.axonframework.modelling.command.AggregateIdentifier;

import java.util.UUID;

@Data
public class CreateMedicalHistoryCommand {
    @AggregateIdentifier
    private String medicalHistoryId;

    private UUID appointmentId;
    private UUID patientId;
    private String symptoms;
    private String treatment;
    private String diagnosis;
    private String disease;
    private String status;

    public CreateMedicalHistoryCommand(String newMedicalHistoryId, String appointmentId, String patientId) {
    }
}
