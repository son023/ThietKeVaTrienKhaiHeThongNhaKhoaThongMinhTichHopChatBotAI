package com.do_an.common.command;


import com.do_an.common.model.MedicineItem;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.axonframework.modelling.command.TargetAggregateIdentifier;

import java.util.List;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CreatePrescriptionCommand {
    @TargetAggregateIdentifier
    private UUID prescriptionId;
    private UUID appointmentId;
    private UUID patientId;
    private UUID doctorId;
    private UUID medicalHistoryId;
    private List<MedicineItem> items;
}