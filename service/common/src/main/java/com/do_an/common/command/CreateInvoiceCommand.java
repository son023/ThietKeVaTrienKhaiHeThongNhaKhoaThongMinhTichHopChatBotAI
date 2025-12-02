package com.do_an.common.command;

import com.do_an.common.model.MedicalServiceDTO;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.axonframework.modelling.command.TargetAggregateIdentifier;

import java.util.List;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CreateInvoiceCommand {
    @TargetAggregateIdentifier
    private UUID clinicalId;
    private UUID invoiceId;
    private UUID appointmentId;
    private UUID patientId;
    private UUID medicalHistoryId;
    private UUID doctorId;
    private List<MedicalServiceDTO> medicalServices;
}