package com.do_an.common.command;

import com.do_an.common.model.MedicineItem;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import org.axonframework.modelling.command.TargetAggregateIdentifier;

import java.util.List;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ReleaseMedicineReservationCommand {
    @TargetAggregateIdentifier
    private UUID dispenseOrderId;
    private UUID prescriptionId;
    private List<MedicineItem> medicineItems;
}