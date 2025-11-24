package com.do_an.common.event;

import com.do_an.common.model.MedicineItem;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class MedicineReservedEvent {
    private UUID prescriptionId;
    private UUID dispenseOrderId;
    private List<MedicineItem> items;
}
